const path = require('path');
const NotificationManager = require('../../internal/NotificationManager.js');

const { exec } = require('child_process');
const { BrowserWindow } = require('electron');

let shutdownScheduled = false;

function shutdownTimer(minutes) {
    if (minutes === 0) {
        if (!shutdownScheduled) {
            NotificationManager.showNotification('Cancelación inválida.', 'No hay ningún apagado programado para cancelar.');
            return;
        }

        exec('shutdown -a', (error) => {
            if (error) {
                console.error(`Error canceling shutdown: ${error.message}`);
                return;
            }
            console.log('Shutdown canceled.');
            shutdownScheduled = false;
        });
        return;
    }

    if (shutdownScheduled) {
        NotificationManager.showNotification('Apagado ya programado.', 'Ya hay un apagado programado.');
        return;
    }

    const command = `shutdown -s -t ${minutes * 60}`;

    exec(command, (error) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }

        console.log(`Command ${command} executed successfully.`);
        shutdownScheduled = true;
    });
};

function customShutdownTimer() {
    let customTimerWindow = new BrowserWindow({
        width: 455,
        height: 270,
        resizable: false,
        icon: path.join(__dirname, '../../img/icons/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    customTimerWindow.loadFile(path.join(__dirname, './index.html'));

    customTimerWindow.setMenu(null);

    customTimerWindow.on('closed', () => {
        customTimerWindow = null;
    });
};

module.exports = { shutdownTimer, customShutdownTimer };
