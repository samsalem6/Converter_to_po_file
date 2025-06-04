# CSV and XLSX to PO File Converter

A simple, user-friendly web application to convert translation CSV or Excel files into PO files for localization (e.g., CakePHP, gettext, etc.).

## Features
- Drag & drop or click to upload CSV or Excel (.xlsx) files
- Supports multiple languages (Italian, French, German, Spanish, Portuguese, English)
- Instant PO file generation and download
- Handles both CSV and Excel formats
- No server required: runs entirely in your browser

## Getting Started

1. **Clone or Download** this repository to your local machine.
2. Open `index.html` in your web browser (double-click or right-click > Open with browser).

> **No installation or build steps required!**

## Usage

1. **Prepare your translation file** as a CSV or Excel file with two columns:
    - **Column 1:** English text (msgid)
    - **Column 2:** Translation (msgstr)

   Example CSV:
   ```csv
   English,Italian
   "Plan your perfect adventure","Pianifica la tua prossima avventura"
   "Welcome","Benvenuto"
   ```

2. **Open the app** (`index.html`).
3. **Select your file** by dragging it into the highlighted area or clicking to browse.
4. **Choose the target language** from the dropdown menu.
5. Click **"Process Translation File"**.
6. Review the generated PO file in the preview area.
7. Click **"Download PO File"** to save your `.po` file.

## Supported File Formats
- `.csv` (Comma-separated values)
- `.xlsx` (Excel files)

## Supported Languages
- Italian (`it`)
- French (`fr`)
- German (`de`)
- Spanish (`es`)
- Portuguese (`pt`)
- English (`en`)

## Dependencies
- [PapaParse](https://www.papaparse.com/) (for CSV parsing)
- [SheetJS (xlsx)](https://sheetjs.com/) (for Excel parsing)

These are loaded via CDN in `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
```

## Customization
- To add more languages, edit the `languageMap` and `<select id="languageSelect">` in `converter.js` and `index.html`.
- To change the PO file header, modify the `createPoFile` function in `converter.js`.

## Troubleshooting
- **File not accepted?** Ensure your file is a valid CSV or Excel file with two columns.
- **No output or errors?** Check your browser console for error messages.
- **Corrupted or unsupported file?** The app will notify you if the file format is not recognized.

## License
MIT License

## Credits
- [PapaParse](https://www.papaparse.com/)
- [SheetJS (xlsx)](https://sheetjs.com/)
- Inspired by open source translation tools and the CakePHP localization workflow. 