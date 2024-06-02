const path = require('path');

const { Notification } = require('electron');

class NotificationManager {
    static showNotification(title, body) {
        const notification = new Notification({
            title: title,
            body: body,
            icon: path.join(__dirname,'../img/icons/icon_64px.png'),
        });
        
        notification.show();
    }
}

module.exports = NotificationManager;
