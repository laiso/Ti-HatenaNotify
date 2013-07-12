(function () {

    var NOTIFICATION_ID = 1;

    function getContentText(notices){
        return notices.count + "件のお知らせを受信しました";
    }

    function sendAndroidNotification(notices){
        var notification = Ti.Android.createNotification({
            contentText: getContentText(notices)
        });
        Ti.Android.NotificationManager.notify(NOTIFICATION_ID, notification);
    }

    function sendIOSNotification(notices) {
        Ti.App.iOS.scheduleLocalNotification({
            alertBody: getContentText(notices),
            alertAction: "開く",
            badge: notices.count,
            date: new Date(new Date().getTime() + 1000)
        });
    }

    function sendAppNotification(notices) {
        if (OS_IOS) {
            sendIOSNotification(notices);
        } else if (OS_ANDROID) {
            sendAndroidNotification(notices);
        }
    }

    function prepareNoticesCount() {
        var req = Ti.Network.createHTTPClient({
            onload: function (e) {
                var notices = JSON.parse(this.responseText);
                if (notices.count > 0) {
                    sendAppNotification(notices);
                }
            },
            timeout: 60 * 1000
        });
        req.open('GET', 'https://www.hatena.ne.jp/notify/notices.count.json');
        req.send();
    }

    // main
    if (OS_IOS) {
        setInterval(function () {
            prepareNoticesCount();
        }, 60 * 1000);
    }

    prepareNoticesCount();

})();