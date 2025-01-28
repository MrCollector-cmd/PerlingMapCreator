import { app, BrowserWindow } from 'electron';

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: './renderer.js',  // Asegúrate de que la ruta sea correcta
        }
    });

    mainWindow.loadFile('index.html'); // Carga el archivo HTML

    mainWindow.on('closed', () => {
        mainWindow = null; // Limpia la ventana al cerrarla
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit(); // Cierra la app en Windows/Linux
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});