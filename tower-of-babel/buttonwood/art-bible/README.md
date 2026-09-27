# Illustrated Buttonwood art bible

The [16-page illustrated companion](illustrated.pdf)
is a designed reading edition of the [canonical art bible](../ART-BIBLE.md).
The Markdown bible owns the complete, maintained standards; this companion
provides visual examples, measurements, comparison sheets and review prompts.
It is not a second source of normative rules.

The original approved concept is embedded whole and unmodified. Every other game
image is exported directly from the existing native Buttonwood art generators.
No third-party game imagery is copied into this document. The Terraria and
Minecraft references inform the stated design interpretation and are linked on
the final page. Deferred work and speculative environments are explicitly labeled.

## Rebuild

Requirements: Node with Playwright and a Chromium-compatible browser; Python
with ReportLab and Pillow. The PDF uses Georgia and Arial system fonts. Set
`BUTTONWOOD_FONT_DIR` to a directory containing `Georgia.ttf`,
`Georgia Italic.ttf`, `Arial.ttf` and `Arial Bold.ttf` if they are not in the
default macOS system font directory. Font files are not copied into the repo.

From the repository root:

```sh
node tower-of-babel/buttonwood/art-bible/export-assets.cjs
python3 tower-of-babel/buttonwood/art-bible/build.py
```

Set `BUTTONWOOD_BROWSER` to an installed Chromium browser executable if Playwright
does not have its own browser installed. The exporter creates a fresh headless
browser and calls only the local art generators. It does not open the live game,
read saves, edit production files or affect the user's browser session.

The builder writes the deliverable to `output/pdf/buttonwood-art-bible.pdf` and
an identical published copy to `illustrated.pdf` beside this README. The PDF
prints repository source locations and keeps its external research links
clickable. This README and the Markdown bible provide source-file navigation,
so both PDF copies remain portable without host-specific or broken local links.

The assets directory contains original-resolution PNG exports. Inspection
enlargements in the builder use nearest-neighbor resampling. The shared palette
is parsed directly from `palette.js`; the footer on the last page includes the
SHA-256 prefix of the canonical Markdown at build time. After changing the bible,
reconcile the companion's curated copy, rebuild and inspect every page. After
changing artwork, regenerate the native PNG exports as well.

## Verification

Render to a temporary intermediate directory and review every page:

```sh
mkdir -p tmp/pdfs/buttonwood
pdftoppm -r 100 -png output/pdf/buttonwood-art-bible.pdf tmp/pdfs/buttonwood/page
```

Check page edges, titles, captions, comparison columns, source links, native
artwork, text extraction, PDF page count and the canonical revision stamp.
The initial edition was rendered and all 16 pages visually reviewed. It has
consistent 816 x 672 point pages, embedded TrueType typography, 32px native UI
art, measured world scale and explicit future-work labels. Layout review includes
every page at readable resolution, not only a contact sheet.

Keep page renders under `tmp/pdfs/`; deliver the PDF, this reproducible builder
and the native asset exports. The generated PNGs are documentation illustrations,
not new production asset sources.
