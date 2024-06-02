const path = require('path');
const NotificationManager = require('../../../internal/NotificationManager.js');

const { BrowserWindow, ipcMain } = require('electron');

ipcMain.handle('set-randomize', (event, options) => {
    if (options.length > 0) {
        const result = Math.floor(Math.random() * options.length);
        return options[result];
    } else {
        NotificationManager.showNotification('No se ha podido "randomizar".', 'No se ha podido escoger una opcion aletaroria, porque no hay opciones que escoger.');
        return '';
    }
});

function launchRandomizer() {
    let randomizerWindow = new BrowserWindow({
        width: 455,
        height: 460,
        resizable: false,
        icon: path.join(__dirname, '../../../img/icons/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    randomizerWindow.loadFile(path.join(__dirname, './index.html'));

    randomizerWindow.setMenu(null);

    randomizerWindow.on('closed', () => {
        randomizerWindow = null;
    });
}

module.exports = { launchRandomizer };
