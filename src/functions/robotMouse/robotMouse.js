const robot = require('robotjs');
const NotificationManager = require('../../internal/NotificationManager.js');

const { screen } = require('electron');

function robotMouse(screenIndex = 0) {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();

    let displayMap = {};
    displayMap[0] = primaryDisplay;

    let secondaryDisplays = displays.filter(display => display.id !== primaryDisplay.id);
    secondaryDisplays.forEach((display, index) => {
        displayMap[index + 1] = display;
    });

    if (screenIndex >= Object.keys(displayMap).length) {
        console.error('Screen index out of range.');
        NotificationManager.showNotification('Error', 'El índice de pantalla está fuera del rango.');
        return;
    }

    const selectedDisplay = displayMap[screenIndex];

    if (!selectedDisplay) {
        console.error('Selected display not found.');
        NotificationManager.showNotification('Error', 'No existe una pantalla secundaria.');
        return;
    }

    let notificationMessage = screenIndex === 0
        ? 'Se ha activado el movimiento del ratón en la pantalla principal.'
        : 'Se ha activado el movimiento del ratón en la pantalla secundaria.';
    
    NotificationManager.showNotification('Ratón robot activado.', notificationMessage);

    let running = true;
    let direction = 1;
    const distance = 100;
    const speed = 30;
    let notificationShown = false;

    const initialPosition = {
        x: selectedDisplay.bounds.x + selectedDisplay.bounds.width - 250,
        y: selectedDisplay.bounds.y + selectedDisplay.bounds.height - 250
    };

    robot.moveMouse(initialPosition.x, initialPosition.y);

    const intervalId = setInterval(() => {
        if (!running) {
            clearInterval(intervalId);
            return;
        }

        let currentPosition = robot.getMousePos();

        if (currentPosition.y !== initialPosition.y) {
            running = false;
            return;
        }

        let newX = currentPosition.x + direction * 10;
        if (newX > initialPosition.x + distance || newX < initialPosition.x - distance) {
            direction *= -1;
        }
        robot.moveMouse(newX, currentPosition.y);
    }, speed);

    function stop() {
        running = false;
        if (!notificationShown) {
            notificationShown = true;
            NotificationManager.showNotification('Ratón robot desactivado.', 'Se ha desactivado el movimiento del ratón.');
        }
    }

    setInterval(() => {
        const currentPosition = robot.getMousePos();
        if (currentPosition.y !== initialPosition.y) {
            stop();
        }
    }, 100);
}

module.exports = { robotMouse };
