# Template asset notes

- Source supplied by the user: `C:\Users\hasyi\Downloads\Biru  Dan Putih Modern ID Card KKN Card.png`.
- Source card dimensions: 1240 × 1748 pixels (portrait).
- Project asset: `public/assets/template-clean.png`.
- Final generated asset dimensions: 1056 × 1489 pixels (portrait).
- Method: built-in image_gen edit using the original PNG as referenced_image_paths, with an opaque background; copied the selected output into the workspace without overwriting the user's original.
- Edit classification: precise-object-edit.
- Cleanup: removed the example woman, all books and hands, and the words "Nama" and "Jabatan". The top event logo, vertical PANITIA title, torn panel concept, faint watermark, and two dark blank text bars remain.
- Expected application coordinate system: 1240 × 1748. Draw this background to that size in Canvas. The generated image has practically the same aspect ratio; the difference is less than one pixel at the original dimensions.
- Visual review: subject and placeholder removal succeeded. The bars remain at the same relative positions and are blank.
- Limitation: this is a generated reconstruction, not the editable original design. The previously hidden watermark was reconstructed, and subtle details of the watermark, torn edges, lettering, flat colors, and shading may differ from the original. Replace this asset with a genuine blank export from the original editor for exact fidelity if one becomes available. The source file was preserved.
- No Python or deterministic raster editing was used; System.Drawing was used only to read dimensions.

## Final edit prompt

```text
Use case: precise-object-edit.
Asset type: fixed empty printable ID card PNG template for browser generation.
Input image 1 is the EDIT TARGET, not merely a stylistic reference.
Primary request: Remove ONLY the woman (entire head, hair, glasses, body, denim clothing, arms, hands) and ALL books she holds. Also remove ONLY the white placeholder words "Nama" and "Jabatan" from the two dark bottom rounded bars. This is a surgical object-removal cleanup of the existing card, NOT a redesigned card.
Reconstruct the currently occluded background behind the removed woman/books naturally using the existing white field and the large faint low-opacity emblem watermark. No new objects or subjects.
KEEP EXACTLY the original card composition, colors, left brown torn-paper panel, black/dark wavy torn-paper divider, white right background, large vertical white "PANITIA" text with its existing shadow on the left, and the original colorful top event logo with its wording and type layout unchanged. Exact top wording: "KEMAH BESAR", "PENGGALANG", "TITIAN KURANJI", "ULAK PATIAN". Do not alter the top logo or left text in any way.
KEEP BOTH existing dark rounded bottom label bars intact, solid uniform dark aubergine, completely blank inside (no text): at the input 1240 x 1748 pixel coordinate scale the first bar is x405, y1470, width720, height112; second bar is x224, y1623, width792, height88. Preserve their positions, proportions, corners, and color precisely.
Preserve the large faded watermark emblem behind the photo area; recover only portions that were obscured. Retain all existing areas outside the removed woman/books and the two placeholder text words pixel-faithfully. Use the same portrait 1240 x 1748 composition, edge positions, proportions, and full-frame crop. No border, no padding, no additional text. Opaque background.
```

## Background without label bars — composition update

- Source: project asset `public/assets/template-clean.png`, 1056 × 1489 pixels.
- New asset: `public/assets/template-background.png`, 1056 × 1490 pixels.
- Method: built-in image_gen edit with `referenced_image_paths`; inspected the result, then copied it into the project. Previous assets were preserved.
- Change: removed only the two bottom dark rounded label bars and reconstructed the torn brown/white background underneath. The application can now draw aligned labels independently in Canvas.
- Visual review: both horizontal bars are fully gone. Top event logo and its wording, vertical PANITIA, brown panel, existing torn edge, and faded watermark remain visually consistent with the previous asset. The newly visible torn edge below the watermark is reconstructed.
- Limitation: generated editing can introduce subtle differences even outside the intended removal area. This asset adds one pixel in height; Canvas should draw it into the canonical card coordinate dimensions.
- No other application files were modified for this asset update.

### Final edit prompt

```text
Use case: precise-object-edit.
Asset type: opaque portrait background PNG for a printable ID card.
Input image 1 is the EDIT TARGET. Perform a narrowly localized cleanup of this existing design.
Primary request: Remove ONLY the two dark aubergine horizontal rounded bars near the very bottom of the card. Remove both entire bars, leaving no dark horizontal rounded shape, no shadow, and no residue. Reconstruct only the small background regions formerly covered by these two bars: continue the existing warm brown left torn-paper panel, the irregular vertical dark torn divider, and white right field underneath naturally. The two bars are at approximately x344,y1252,width614,height95 and x191,y1382,width674,height75 at the source image 1056 x 1489 pixel scale.
Do not add replacement bars, new text, labels, photos, subjects, borders, or decorations. The cleaned bottom area is blank background only.
Invariants: Preserve everything outside the two former bar areas exactly. Keep the original top event logo at precisely the same location, size, colors, shape, and lettering. Exact unchanged top wording: "KEMAH BESAR", "PENGGALANG", "TITIAN KURANJI", "ULAK PATIAN". Keep the vertical white "PANITIA" title and its shadow unchanged, the warm brown left panel unchanged, the torn-edge shapes unchanged wherever they were already visible, and the large low-opacity colored watermark emblem on the white right side unchanged. Preserve the existing overall proportions and portrait full-frame crop. Same 1056 x 1489 composition. Opaque background.
This is object removal from the supplied design, NOT a redesign. Do not retouch the typography, redraw the logos, sharpen the watermark, alter color grading, or change the layout.
```

## Peserta template — exact supplied asset

- Source: clean participant template supplied by the user, `Template ID Card Kembang Gerapah (1).png`.
- Project asset: `public/assets/template-peserta.png`.
- Dimensions: 1240 × 1748 pixels; embedded resolution is approximately 300 DPI (299.9994).
- Method: exact filesystem copy. SHA-256 comparison confirmed the project asset is byte-for-byte identical to the supplied file.
- No imagegen, raster edit, reconstruction, redesign, resizing, or color conversion was used.
- Preserved the supplied red panel/colors, white torn divider, top event logo and wording, vertical PESERTA lettering/shadow, faint event watermark, and bottom-right decorative shapes.
- Metadata was also preserved with the exact copy: PNG contains pHYs, iTXt/XMP, and eXIf chunks. The template's supplied file metadata is distinct from user form/photo data, which remains in browser memory.
- Existing Panitia template assets were left unchanged.

## Print size update — 5.5 × 8.5 cm portrait

- Both supplied portrait backgrounds remain unchanged on disk.
- Canvas uses uniform cover scaling into 650 × 1004 px at 300 DPI. The small horizontal crop is centered; the complete event logo and vertical role lettering remain inside the card.
- The original artwork is not stretched, regenerated, or retouched for this size change.
- Optional photos use a 2 × 3 cm area to fit the smaller card. Photo frames and both text labels were resized and repositioned together; the participant labels retain their red palette.
- PNG dimensions and pHYs metadata yield physical dimensions within 0.01 cm of the nominal 5.5 × 8.5 cm size. Print at 100% rather than fit-to-page.



