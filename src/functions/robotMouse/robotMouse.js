const robot = require('robotjs');
const NotificationManager = require('../../internal/NotificationManager.js');

function robotMouse() {
    NotificationManager.showNotification('Ratón robot activado.', 'El movimiento del ratón se ha activado.');

    let running = true;
    let direction = 1;
    const screenSize = robot.getScreenSize();
    const distance = 100;
    const speed = 30;
    let notificationShown = false;

    const initialPosition = {
        x: screenSize.width - 250,
        y: screenSize.height - 250 
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
            NotificationManager.showNotification('Ratón robot desactivado.', 'El movimiento del ratón ha sido detenido.');
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
