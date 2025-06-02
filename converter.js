// Let's try to read the uploaded file
async function readAndProcessFile() {
    try {
        // Try to read the file as text first
        const textData = await window.fs.readFile('it.csv', { encoding: 'utf8' });
        console.log('File content (first 500 chars):', textData.substring(0, 500));
        
        // Check if it's actually a CSV or if it's corrupted
        if (textData.includes('PK') && textData.includes('xml')) {
            console.log('This appears to be an Excel file (.xlsx), not a CSV file');
            return 'ERROR: The file appears to be an Excel file (.xlsx), not a CSV file. Please convert it to CSV format first.';
        }
        
        return textData;
    } catch (error) {
        console.error('Error reading file:', error);
        return 'ERROR: Could not read the file - ' + error.message;
    }
}

// Function to create PO file content
function createPoFile(translations) {
    let poContent = `# Italian Translation File
# Generated automatically
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Language: it\\n"
"MIME-Version: 1.0\\n"
"Content-Transfer-Encoding: 8bit\\n"

`;

    translations.forEach(translation => {
        poContent += `msgid "${translation.english}"\n`;
        poContent += `msgstr "${translation.italian}"\n\n`;
    });

    return poContent;
}

// Main function
async function processFile() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Reading file...';
    
    const fileContent = await readAndProcessFile();
    
    if (fileContent.startsWith('ERROR:')) {
        resultDiv.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 5px;">
            ${fileContent}
        </div>`;
        return;
    }
    
    resultDiv.innerHTML = `<div style="color: orange; padding: 10px; border: 1px solid orange; border-radius: 5px;">
        <strong>File Analysis:</strong><br>
        The uploaded file appears to be corrupted or in an unsupported format.<br><br>
        <strong>Please provide a clean CSV file with the following format:</strong><br>
        - Column 1: English text<br>
        - Column 2: Italian translation<br><br>
        <strong>Example CSV content:</strong><br>
        <code>
        English,Italian<br>
        "Plan your perfect adventure","Pianifica la tua prossima avventura"<br>
        "Welcome to our website","Benvenuto nel nostro sito web"
        </code>
    </div>`;
}

// Utility: Map language codes to names
const languageMap = {
    it: 'Italian',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    pt: 'Portuguese',
    en: 'English'
};

let parsedTranslations = [];
let poContent = '';

function showMessage(msg, type = 'info') {
    const messages = document.getElementById('messages');
    messages.innerHTML = `<div style="color: ${type === 'error' ? 'red' : type === 'success' ? 'green' : '#007cba'}; padding: 10px; border: 1px solid ${type === 'error' ? 'red' : type === 'success' ? 'green' : '#007cba'}; border-radius: 5px; margin-bottom: 10px;">${msg}</div>`;
}

function resetUI() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('downloadBtn').style.display = 'none';
    showMessage('');
}

function handleFile(file) {
    resetUI();
    if (!file) {
        showMessage('No file selected.', 'error');
        return;
    }
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
        showMessage('Parsing CSV file...');
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.errors.length) {
                    showMessage('CSV parsing error: ' + results.errors[0].message, 'error');
                    return;
                }
                if (!results.data || results.data.length === 0) {
                    showMessage('CSV file is empty or invalid.', 'error');
                    return;
                }
                // Expecting two columns: English, Translation
                const firstRow = results.data[0];
                const keys = Object.keys(firstRow);
                if (keys.length < 2) {
                    showMessage('CSV must have at least two columns: English and Translation.', 'error');
                    return;
                }
                parsedTranslations = results.data.map(row => ({
                    english: row[keys[0]],
                    translation: row[keys[1]]
                }));
                showMessage('CSV parsed successfully. Ready to generate PO file.', 'success');
                document.getElementById('processBtn').disabled = false;
            }
        });
    } else if (fileName.endsWith('.xlsx')) {
        showMessage('Parsing Excel file...');
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
            if (!json || json.length < 2) {
                showMessage('Excel file is empty or invalid.', 'error');
                return;
            }
            // Assume first row is header
            const rows = json.slice(1);
            parsedTranslations = rows.map(row => ({
                english: row[0],
                translation: row[1]
            })).filter(t => t.english && t.translation);
            if (parsedTranslations.length === 0) {
                showMessage('No valid translation pairs found in Excel file.', 'error');
                return;
            }
            showMessage('Excel file parsed successfully. Ready to generate PO file.', 'success');
            document.getElementById('processBtn').disabled = false;
        };
        reader.readAsArrayBuffer(file);
    } else {
        showMessage('Please upload a CSV or Excel (.xlsx) file.', 'error');
        return;
    }
}

function createPoFile(translations, langCode) {
    let po = `# ${languageMap[langCode] || langCode} Translation File\n# Generated automatically\nmsgid ""\nmsgstr ""\n"Content-Type: text/plain; charset=UTF-8\\n"\n"Language: ${langCode}\\n"\n"MIME-Version: 1.0\\n"\n"Content-Transfer-Encoding: 8bit\\n"\n\n`;
    translations.forEach(t => {
        po += `msgid "${(t.english || '').replace(/"/g, '\"')}"\n`;
        po += `msgstr "${(t.translation || '').replace(/"/g, '\"')}"\n\n`;
    });
    return po;
}

function processFile() {
    if (!parsedTranslations.length) {
        showMessage('No translations to process.', 'error');
        return;
    }
    const langCode = document.getElementById('languageSelect').value;
    poContent = createPoFile(parsedTranslations, langCode);
    document.getElementById('result').innerHTML = `<pre style="background: #f8f8f8; padding: 10px; border-radius: 3px; max-height: 300px; overflow:auto;">${poContent.replace(/</g, '&lt;')}</pre>`;
    document.getElementById('downloadBtn').style.display = 'inline-block';
    showMessage('PO file generated! You can now download it.', 'success');
}

function downloadPoFile() {
    if (!poContent) return;
    const langCode = document.getElementById('languageSelect').value;
    const blob = new Blob([poContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `translations_${langCode}.po`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Event listeners
window.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFileInput');
    const dragArea = document.getElementById('drag-area');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    dragArea.addEventListener('click', () => fileInput.click());
    dragArea.addEventListener('dragover', e => {
        e.preventDefault();
        dragArea.classList.add('dragover');
    });
    dragArea.addEventListener('dragleave', e => {
        e.preventDefault();
        dragArea.classList.remove('dragover');
    });
    dragArea.addEventListener('drop', e => {
        e.preventDefault();
        dragArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            fileInput.files = e.dataTransfer.files;
            handleFile(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener('change', e => {
        if (fileInput.files && fileInput.files[0]) {
            handleFile(fileInput.files[0]);
        }
    });
    processBtn.addEventListener('click', processFile);
    downloadBtn.addEventListener('click', downloadPoFile);
    document.getElementById('languageSelect').addEventListener('change', resetUI);
});
