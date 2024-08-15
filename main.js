// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let pipWindow;

app.commandLine.appendSwitch("--enable-harde-secure-decryption");

function createWindow() {
    mainWindow = new BrowserWindow({
        title: "AlwaysOnTop",
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true
        },
        icon: path.join(__dirname, 'icon.png'),
    });

    mainWindow.setMenu(null);
    mainWindow.loadFile('index.html');
}

function createPiPWindow(url) {
    if (!url) {
        console.error('No URL provided for PiP window.');
        return;
    }

    if (pipWindow) {
        pipWindow.close();
    }

    pipWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: true,
        center: true,
        alwaysOnTop: true,
        resizable: true,
        fullscreenable: false,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            webSecurity: false,
            plugins: true,
            allowRunningInsecureContent: true,
            nodeIntegrationInWorker: true,
            devTools: true,
        },
    });
    pipWindow.setMenu(null);
    pipWindow.setResizable(true);
    pipWindow.setAlwaysOnTop(true, "screen-saver");
    pipWindow.addListener("blur", () => {
        pipWindow.setAlwaysOnTop(true, "screen-saver");
    });

    pipWindow.loadURL(url).catch(err => {
        console.error('Failed to load URL in PiP window:', err);
    });

    pipWindow.on('closed', () => {
        pipWindow = null;
        mainWindow.restore();
        mainWindow.focus();
    });

    pipWindow.addListener("keydown", (event) => {
        
        console.log(event.key);
        

        if (event.key === "Escape") {
            pipWindow.close();
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.on('open-pip', (event, url) => {
        createPiPWindow(url);
        console.log("Opening PiP window...");

        mainWindow.minimize();
    });

    ipcMain.on('close-pip-window', () => {
        console.log('Closing PiP window...');

        pipWindow.close();

    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
