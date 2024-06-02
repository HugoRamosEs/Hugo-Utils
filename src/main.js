const path = require('path');
const NotificationManager = require('./internal/NotificationManager');

const { app, Tray, Menu, ipcMain } = require('electron');
const { readFileSync } = require('fs');
const { shutdownTimer, customShutdownTimer } = require('./functions/shutdownTimer/shutdownTimer');
const { runCleanupTasks, restartExplorer, defragmentDisks } = require('./functions/maintenance/maintenance');
const { launchLeagueOfLegends } = require('./functions/games/games');
const { launchRandomizer } = require('./functions/apps/randomizer/randomizer');
const { robotMouse } = require('./functions/robotMouse/robotMouse');

const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
let tray = null;

app.on('ready', () => {
    if (process.platform !== 'win32') {
        NotificationManager.showNotification('Sistema operativo no soportado.', 'Esta aplicacion solo está disponible en Windows.');
        app.quit();
    }

    app.setAppUserModelId('Hugo-Utils')
    tray = new Tray(path.join(__dirname, 'img/icons/icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: `Hugo-Utils - V.${packageJson.version}`,
            enabled: false,
        },
        { type: 'separator' },
        {
            label: 'Apagar PC en...',
            submenu: [
                { label: '15 min', click: () => shutdownTimer(15) },
                { label: '30 min', click: () => shutdownTimer(30) },
                { label: '1h', click: () => shutdownTimer(60) },
                { label: '2h', click: () => shutdownTimer(120) },
                { label: 'Tiempo personalizado...', click: () => customShutdownTimer() },
                { type: 'separator' },
                { label: 'Cancelar apagado', click: () => shutdownTimer(0) },
            ],
        },
        {
            label: 'Aplicaciones',
            submenu: [
                { label: 'Randomizer', click: () => launchRandomizer() },
            ],
        },
        {
            label: 'Sistema',
            submenu: [
                { label: 'Reiniciar explorer.exe', click: () => restartExplorer() },
                { label: 'Limpiar disco y archivos temporales', click: () => runCleanupTasks() },
                { label: 'Desfragmentar/Optimizar discos duros', click: () => defragmentDisks() },
            ],
        },
        {
            label: 'Ratón Robot',
            click: () => robotMouse(),
        },
        {
            label: 'Abrir League Of Legends', 
            click: () => launchLeagueOfLegends(),
        },
        { type: 'separator' },
        {
            label: 'Salir',
            click: () => app.quit(),
        }
    ]);

    tray.setToolTip(`Hugo-Utils - V.${packageJson.version}`);
    tray.setContextMenu(contextMenu);

    tray.on('right-click', () => {
        tray.popUpContextMenu(contextMenu);
    });

    ipcMain.on('set-shutdown-timer', (event, totalTime) => {
        shutdownTimer(totalTime);
    });

    app.on('window-all-closed', (event) => {
        event.preventDefault();
    });
});
