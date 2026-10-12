import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import Cropper from 'react-easy-crop'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  PHOTO_AREA,
  downloadBlob,
  exportPng,
  loadTemplate,
  makeFilename,
  renderCard,
} from './lib/card'
import type { CropArea } from './lib/card'
import { loadPhoto } from './lib/photo'
import './styles.css'

type Photo = { image: HTMLImageElement; url: string; filename: string }
type Fits = { nameFits: boolean; positionFits: boolean }

const EMPTY_FITS: Fits = { nameFits: true, positionFits: true }

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function sameArea(first: CropArea | null, second: CropArea) {
  return first?.x === second.x && first.y === second.y
    && first.width === second.width && first.height === second.height
}

export default function App() {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [template, setTemplate] = useState<HTMLImageElement | null>(null)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [crop, setCrop] = useState<CropArea | null>(null)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [fits, setFits] = useState<Fits>(EMPTY_FITS)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [previewUpdating, setPreviewUpdating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const photoUrlRef = useRef<string | null>(null)
  const uploadTokenRef = useRef(0)
  const dragDepthRef = useRef(0)
  const exportLockRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([loadTemplate(), document.fonts.ready])
      .then(([image]) => {
        if (!cancelled) setTemplate(image)
      })
      .catch((error: unknown) => {
        if (!cancelled) setTemplateError(errorMessage(error, 'Template gagal dimuat. Muat ulang halaman untuk mencoba lagi.'))
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => () => {
    uploadTokenRef.current += 1
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
  }, [])

  useEffect(() => {
    if (!template || !canvasRef.current) return
    let cancelled = false
    setPreviewUpdating(true)
    document.fonts.ready.then(() => {
      if (cancelled || !canvasRef.current) return
      try {
        const nextFits = renderCard(canvasRef.current, template, { name, position, photo: photo?.image ?? null, crop })
        setFits((previous) => previous.nameFits === nextFits.nameFits && previous.positionFits === nextFits.positionFits ? previous : nextFits)
        setRenderError(null)
      } catch (error: unknown) {
        setRenderError(errorMessage(error, 'Preview belum dapat dibuat. Coba ganti foto atau muat ulang halaman.'))
      } finally {
        setPreviewUpdating(false)
      }
    }).catch((error: unknown) => {
      if (!cancelled) {
        setRenderError(errorMessage(error, 'Font gagal dimuat. Muat ulang halaman untuk mencoba lagi.'))
        setPreviewUpdating(false)
      }
    })
    return () => { cancelled = true }
  }, [template, name, position, photo, crop])

  const completedFields = Number(Boolean(name.trim())) + Number(Boolean(position.trim())) + Number(Boolean(photo))
  const ready = Boolean(template && name.trim() && position.trim() && photo && crop
    && fits.nameFits && fits.positionFits && !templateError && !renderError
    && !uploading && !exporting && !previewUpdating)

  const clearDownloadMessage = () => {
    setDownloadError(null)
    setDownloadStatus(null)
  }

  async function selectPhoto(file: File) {
    const token = ++uploadTokenRef.current
    setUploading(true)
    setPhotoError(null)
    clearDownloadMessage()
    try {
      const loaded = await loadPhoto(file)
      if (uploadTokenRef.current !== token) {
        URL.revokeObjectURL(loaded.url)
        return
      }
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
      photoUrlRef.current = loaded.url
      setCrop(null)
      setCropPosition({ x: 0, y: 0 })
      setZoom(1)
      setPhoto({ ...loaded, filename: file.name })
    } catch (error: unknown) {
      if (uploadTokenRef.current === token) {
        setPhotoError(errorMessage(error, 'Foto gagal dibuka. Pilih foto JPG atau PNG lain.'))
      }
    } finally {
      if (uploadTokenRef.current === token) setUploading(false)
    }
  }

  function removePhoto() {
    uploadTokenRef.current += 1
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
    photoUrlRef.current = null
    setPhoto(null)
    setCrop(null)
    setCropPosition({ x: 0, y: 0 })
    setZoom(1)
    setPhotoError(null)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    clearDownloadMessage()
  }

  function reset() {
    if (exportLockRef.current) return
    removePhoto()
    setName('')
    setPosition('')
    setFits(EMPTY_FITS)
    setDragging(false)
    dragDepthRef.current = 0
    document.getElementById('card-name')?.focus()
  }

  const onCropComplete = useCallback((_area: CropArea, pixelArea: CropArea) => {
    setCrop((previous) => sameArea(previous, pixelArea) ? previous : pixelArea)
    setDownloadStatus(null)
    setDownloadError(null)
  }, [])

  function onDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    if (exporting || uploading) return
    dragDepthRef.current += 1
    setDragging(true)
  }

  function onDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (!dragDepthRef.current) setDragging(false)
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    dragDepthRef.current = 0
    setDragging(false)
    if (exporting || uploading) return
    const files = event.dataTransfer.files
    if (files.length !== 1) {
      setPhotoError('Pilih satu foto untuk setiap kartu.')
      return
    }
    void selectPhoto(files[0])
  }

  async function handleDownload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ready || !template || exportLockRef.current) return
    exportLockRef.current = true
    setExporting(true)
    clearDownloadMessage()
    try {
      await document.fonts.ready
      const blob = await exportPng(template, { name: name.trim(), position: position.trim(), photo: photo?.image ?? null, crop })
      downloadBlob(blob, makeFilename(name))
      setDownloadStatus('PNG siap. Periksa folder unduhan Anda.')
    } catch (error: unknown) {
      setDownloadError(errorMessage(error, 'PNG gagal dibuat. Coba unduh kembali.'))
    } finally {
      exportLockRef.current = false
      setExporting(false)
    }
  }

  const statusLabel = templateError || renderError ? 'Perlu diperiksa'
    : !template ? 'Memuat template'
      : uploading ? 'Memuat foto'
        : exporting ? 'Menyiapkan PNG'
          : ready ? 'Siap diunduh' : 'Sedang disusun'

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="./" aria-label="Kartu, beranda">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          Kartu<span className="wordmark-dot">.</span>
        </a>
        <div className="template-tag"><span>Template</span> Kemah Besar · Titian Kuranji</div>
      </header>

      <main className="workspace">
        <section className="editor" aria-labelledby="page-title">
          <div className="intro">
            <p className="eyebrow">ID CARD GENERATOR</p>
            <h1 id="page-title">Satu foto.<br />Satu kartu.</h1>
            <p className="intro-copy">Tambahkan data Anda. Kartu langsung terbentuk,<br className="desktop-break" /> siap dibawa ke acara.</p>
          </div>

          <form id="card-form" onSubmit={handleDownload} noValidate>
            <section className="form-section" aria-labelledby="details-title">
              <div className="section-heading">
                <h2 id="details-title"><span className="step-number">01</span> Data diri</h2>
                <span className="section-caption">{completedFields}/3 terisi</span>
              </div>
              <div className="field">
                <label htmlFor="card-name">Nama lengkap <span aria-hidden="true">*</span></label>
                <input id="card-name" type="text" autoComplete="name" placeholder="Contoh: Ahmad Fauzi" required maxLength={80} value={name}
                  aria-invalid={!fits.nameFits} aria-describedby={!fits.nameFits ? 'name-error' : undefined} disabled={exporting}
                  onChange={(event) => { setName(event.target.value); clearDownloadMessage() }} />
                {!fits.nameFits && <p id="name-error" className="field-error">Nama terlalu panjang untuk template. Gunakan nama yang lebih singkat.</p>}
              </div>
              <div className="field">
                <label htmlFor="card-position">Jabatan <span aria-hidden="true">*</span></label>
                <input id="card-position" type="text" autoComplete="organization-title" placeholder="Contoh: Koordinator acara" required maxLength={120} value={position}
                  aria-invalid={!fits.positionFits} aria-describedby={!fits.positionFits ? 'position-error' : undefined} disabled={exporting}
                  onChange={(event) => { setPosition(event.target.value); clearDownloadMessage() }} />
                {!fits.positionFits && <p id="position-error" className="field-error">Jabatan terlalu panjang untuk template. Singkat teks agar tetap terbaca.</p>}
              </div>
            </section>

            <section className="form-section photo-section" aria-labelledby="photo-title">
              <div className="section-heading">
                <h2 id="photo-title"><span className="step-number">02</span> Foto Anda</h2>
                <span className="section-caption">JPG / PNG · maks. 10 MB</span>
              </div>
              <input ref={fileRef} className="file-input" id="card-photo" type="file" accept="image/jpeg,image/png" aria-label="Unggah foto JPG atau PNG" tabIndex={-1} disabled={exporting || uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void selectPhoto(file)
                  event.target.value = ''
                }} />

              {!photo ? (
                <button type="button" className={`upload-zone${dragging ? ' is-dragging' : ''}`} disabled={exporting || uploading}
                  onClick={() => fileRef.current?.click()} onDragEnter={onDragEnter} onDragOver={(event) => event.preventDefault()} onDragLeave={onDragLeave} onDrop={onDrop}
                  aria-describedby="photo-hint">
                  <span className="upload-symbol" aria-hidden="true"><span /></span>
                  <span className="upload-title">{uploading ? 'Membuka foto…' : dragging ? 'Lepaskan foto di sini' : 'Pilih foto dari perangkat'}</span>
                  <span className="upload-description">atau seret dan letakkan di sini</span>
                </button>
              ) : (
                <div className={`photo-editor${dragging ? ' is-dragging' : ''}`} onDragEnter={onDragEnter} onDragOver={(event) => event.preventDefault()} onDragLeave={onDragLeave} onDrop={onDrop}>
                  <div className="crop-container" aria-label="Atur potongan foto dengan menggeser foto atau menggunakan tombol panah">
                    <Cropper key={photo.url} image={photo.url} crop={cropPosition} zoom={zoom}
                      aspect={PHOTO_AREA.width / PHOTO_AREA.height}
                      onCropChange={(nextCrop) => { if (!exporting) setCropPosition(nextCrop) }}
                      onZoomChange={(nextZoom) => { if (!exporting) setZoom(nextZoom) }}
                      onCropComplete={onCropComplete} onCropAreaChange={onCropComplete} minZoom={1} maxZoom={3} restrictPosition
                      showGrid={false} zoomWithScroll={false} keyboardStep={8}
                      classes={{ containerClassName: 'cropper', cropAreaClassName: 'crop-frame' }} />
                  </div>
                  <div className="crop-toolbar">
                    <label htmlFor="photo-zoom">Zoom</label>
                    <span className="zoom-minus" aria-hidden="true">−</span>
                    <input id="photo-zoom" type="range" min="1" max="3" step="0.01" value={zoom} disabled={exporting || uploading}
                      onChange={(event) => { setZoom(Number(event.target.value)); clearDownloadMessage() }} aria-valuetext={`${Math.round(zoom * 100)} persen`} />
                    <span className="zoom-plus" aria-hidden="true">+</span>
                  </div>
                  <div className="photo-meta">
                    <span className="photo-filename" title={photo.filename}>{uploading ? 'Membuka foto…' : photo.filename}</span>
                    <button type="button" className="text-button" onClick={() => fileRef.current?.click()} disabled={exporting || uploading}>Ganti</button>
                    <button type="button" className="text-button muted" onClick={removePhoto} disabled={exporting} aria-label="Hapus foto">Hapus</button>
                  </div>
                </div>
              )}
              <p id="photo-hint" className="field-hint">{photo ? 'Geser foto untuk menyesuaikan posisi wajah.' : 'Gunakan foto yang jelas dengan wajah menghadap depan.'}<br />PNG transparan memberi hasil seperti contoh template.</p>
              {photoError && <p className="field-error" role="alert">{photoError}</p>}
            </section>

            <div className="editor-footer">
              <p><span className="privacy-symbol" aria-hidden="true" />Data dan foto diproses di perangkat Anda.</p>
              <button type="button" className="reset-button" disabled={exporting || (!name && !position && !photo && !uploading)} onClick={reset}>Reset</button>
            </div>
          </form>
        </section>

        <section className="preview-column" aria-labelledby="preview-title">
          <div className="preview-heading">
            <h2 id="preview-title">Preview kartu</h2>
            <span className={`status-badge${ready ? ' is-ready' : ''}`} role="status"><span aria-hidden="true" />{statusLabel}</span>
          </div>
          <div className="preview-stage" aria-busy={!template || previewUpdating}>
            <div className="card-frame">
              <canvas ref={canvasRef} width={CARD_WIDTH} height={CARD_HEIGHT} role="img"
                aria-label={`Preview ID card. Nama: ${name.trim() || 'belum diisi'}. Jabatan: ${position.trim() || 'belum diisi'}. Foto: ${photo ? 'ditambahkan' : 'belum ditambahkan'}.`} />
              {!template && <div className="template-loading"><span className="loading-card" aria-hidden="true" /><p>{templateError ? 'Template belum tersedia' : 'Menyiapkan template…'}</p></div>}
            </div>
          </div>
          <div className="export-spec"><span>{CARD_WIDTH} × {CARD_HEIGHT} px</span><span>PNG · kualitas penuh</span></div>
          <button form="card-form" type="submit" className="download-button" disabled={!ready} aria-describedby="download-hint">
            <span className={`download-symbol${exporting ? ' is-processing' : ''}`} aria-hidden="true" />
            {exporting ? 'Menyiapkan PNG…' : 'Unduh PNG'}
          </button>
          <p id="download-hint" className="download-hint">{ready ? 'Kartu Anda siap. Simpan dan gunakan.' : 'Lengkapi nama, jabatan, dan foto untuk mengunduh.'}</p>
          {(templateError || renderError || downloadError) && <p className="preview-error" role="alert">{templateError || renderError || downloadError}</p>}
          {downloadStatus && <p className="download-success" role="status">{downloadStatus}</p>}
        </section>
      </main>

      <footer className="site-footer"><span>Dibuat untuk momen kebersamaan.</span><span>Tanpa akun. Langsung jadi.</span></footer>
    </div>
  )
}
