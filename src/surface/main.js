const { app, BrowserWindow, ipcMain, shell } = require('electron')
const os = require('os');
const path = require('path');
const fs = require('fs');

let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 600,
        height: 600,
        backgroundColor: '#ffffff',
        icon: `file://${__dirname}/dist/surface/assets/img/logo.png`
    })


    win.loadURL(`file://${__dirname}/dist/surface/index.html`)

    //// uncomment below to open the DevTools.
    // win.webContents.openDevTools()

    // Event when the window is closed.
    win.on('closed', function() {
        win = null
    })
}

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {

    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // macOS specific close process
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('print-to-pdf', event => {
    console.log('print')
    const pdfPath = path.join(os.tmpdir(), `Lieferschein${new Date().getTime()}.pdf`);
    const win = BrowserWindow.fromWebContents(event.sender);


    win.webContents.printToPDF({}, (error, data) => {
        if (error) {
            return console.log(error.message);
        }
        console.log('no error', pdfPath)

        fs.writeFile(pdfPath, data, err => {
            if (err) {
                return console.log(err.message)
            }
            shell.openExternal('file://' + pdfPath)
        })

    })
})