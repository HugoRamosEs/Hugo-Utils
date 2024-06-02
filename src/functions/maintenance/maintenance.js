const path = require('path');
const sudo = require('sudo-prompt');
const fs = require('fs');
const NotificationManager = require('../../internal/NotificationManager.js');

const { exec } = require('child_process');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const execAsync = promisify(exec);
const sudoOptions = {
    name: 'Hugo Utils'
};

async function createBatchFile(commands, filePath) {
    const batchContent = commands.join('\n');
    await writeFileAsync(filePath, batchContent, 'utf8');
}

async function runCleanupTasks() {
    try {
        await execAsync('del /q/f/s %TEMP%\\*');
        console.log('User temp files deleted successfully.');
        let userTempCleaned = true;

        await execAsync('del /q/f/s C:\\Windows\\Temp\\*');
        console.log('Windows temp files deleted successfully.');
        let windowsTempCleaned = true;

        const batchFilePath = path.join(__dirname, 'cleanup.bat');
        const batchCommands = [
            'cleanmgr.exe /d C: /VERYLOWDISK',
            'Dism.exe /online /Cleanup-Image /StartComponentCleanup /ResetBase'
        ];
        await createBatchFile(batchCommands, batchFilePath);

        await promisifySudo(batchFilePath);
        console.log('Disk and image cleaned successfully.');
        let diskCleaned = true;
        let imageCleaned = true;

        if (userTempCleaned && windowsTempCleaned && diskCleaned && imageCleaned) {
            NotificationManager.showNotification('Mantenimiento completado', 'Archivos temporales y disco limpiados correctamente.');
        }
    } catch (error) {
        console.error(`Error during cleanup tasks: ${error.message}`);
        NotificationManager.showNotification('Error durante las tareas de limpieza.', error.message);
    }
}

async function restartExplorer() {
    exec('taskkill /f /im explorer.exe', (error) => {
        if (error) {
            console.error(`Error terminating explorer.exe: ${error.message}`);
            NotificationManager.showNotification('Error al cerrar explorer.exe', error.message);
            return;
        }

        setTimeout(() => {
            exec('explorer.exe', (error) => {
                if (error) {
                    console.error(`Error restarting explorer.exe: ${error.message}`);
                    return;
                }
                console.log('explorer.exe restarted successfully.');
            });
        }, 500);
    });
}

async function defragmentDisks() {
    exec('wmic logicaldisk get name', async (error, stdout) => {
        if (error) {
            console.error(`Error al obtener las unidades de disco: ${error}`);
            return;
        }

        const drives = stdout.trim().split('\n').slice(1);
        const batchFilePath = path.join(__dirname, 'defrag.bat');
        const batchCommands = drives.map(drive => `defrag ${drive.trim()} /O`);

        await createBatchFile(batchCommands, batchFilePath);

        sudo.exec(`cmd /c ${batchFilePath}`, sudoOptions, (error) => {
            if (error) {
                console.error(`Error executing defragmentation: ${error.message}`);
                NotificationManager.showNotification('Error durante la desfragmentación de discos.', error.message);
                return;
            }
            console.log('Defragmentation completed for all drives.');
            NotificationManager.showNotification('Desfragmentación Completa.', 'Todas las unidades han sido desfragmentadas/optimizadas correctamente.');
        });
    });
}

function promisifySudo(command) {
    return new Promise((resolve, reject) => {
        sudo.exec(`cmd /c ${command}`, sudoOptions, (error, stdout) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

module.exports = { runCleanupTasks, restartExplorer, defragmentDisks };
