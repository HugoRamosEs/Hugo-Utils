const NotificationManager = require('../../internal/NotificationManager.js');

const { exec } = require('child_process');

function launchLeagueOfLegends() {
    exec('"C:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe" --launch-product=league_of_legends --launch-patchline=live', (error) => {
        if (error) {
            console.error(`Error executing RiotClientServices.exe: ${error.message}`);
            NotificationManager.showNotification('Error al ejecutar RiotClientServices.exe', error.message);
            return;
        }
        console.log('RiotClientServices.exe executed succesfully.');
    });

    exec('"C:\\Program Files (x86)\\Overwolf\\OverwolfLauncher.exe" -launchapp pibhbkkgefgheeglaeemkkfjlhidhcedalapdggh -from-desktop', (error) => {
        if (error) {
            console.error(`Error executing OverwolfLauncher.exe: ${error.message}`);
            NotificationManager.showNotification('Error al ejecutar OverwolfLauncher.exe', error.message);
            return;
        }
        console.log('OverwolfLauncher.exe executed succesfully.');
    });
}

module.exports = { launchLeagueOfLegends };
