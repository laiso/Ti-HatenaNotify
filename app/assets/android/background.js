(function () {
    var NOTIFICATION_ID = 1;

    function getContentText(notices) {
        return notices.count + "件のお知らせを受信しました";
    }

    function refreshNotificationCount(notices) {
        Ti.App.Properties.setInt('notificationCount', notices.count);
    }

    function sendAppNotification(notices) {
        debugger
        var notification = Ti.Android.createNotification({
            contentIntent: Ti.Android.createPendingIntent( {
                activity : Ti.Android.currentActivity,
                intent : Ti.Android.currentActivity.intent,
                type : Ti.Android.PENDING_INTENT_FOR_ACTIVITY,
                flags : Ti.Android.FLAG_ACTIVITY_NO_HISTORY
            }),
            contentText: getContentText(notices)
        });
        Ti.Android.NotificationManager.notify(NOTIFICATION_ID, notification);

        refreshNotificationCount(notices);
    }

    function getLaunchIntent(){
        var intent = Ti.Android.createIntent( {
            action : Ti.Android.ACTION_MAIN,
            className : Ti.App.id+'HatenanotifyActivity',
            packageName : Ti.App.id
        });
        intent.addCategory(Titanium.Android.CATEGORY_LAUNCHER);
        return intent;
    }

    function getCookie(){
        return Ti.Android.currentService.intent.getStringExtra('cookie');
    }

    function prepareNoticesCount() {
        var req = Ti.Network.createHTTPClient({
            onload: function (e) {
                var notices = JSON.parse(this.responseText);
                if (notices.count > 0) {
                    sendAppNotification(notices);
                }
            },
            onerror:function(e){
                Ti.API.error('Could not authenticate. cookie: '+getCookie());
            },
            timeout: 60 * 1000,
            withCredentials: true
        });
        req.setRequestHeader('Cookie', 'rk='+getCookie());
        req.open('GET', 'http://www.hatena.ne.jp/notify/notices.count.json');
        req.send();
    }

    // main
    prepareNoticesCount();
})();