// Generated by CoffeeScript 1.6.3
var NOTICES_URL, beforeload, bindAppEvents, bindWebView, dismissPreview, getCookie, hasCookie, insertAndroidAdView, isAuthUrl, isFailedToContentLoad, isLogged, isOpenInRootWindow, load, loadLogin, loadLogout, loadNotices, onAdError, onLoadError, openPreview, registerIOSBackgroungTask, startAndroidService;

beforeload = function(ev) {
  if (OS_IOS && !isOpenInRootWindow(ev.url)) {
    $.rootWebView.stopLoading();
    return openPreview(ev.url);
  }
};

load = function(ev) {
  if (isFailedToContentLoad(ev.source)) {
    loadLogin();
  }
  return;
  if (isAuthUrl(ev.url) && isLogged(ev.source)) {
    return loadNotices();
  }
};

isFailedToContentLoad = function(webView) {
  return webView.evalJS("document.body.childNodes.length") === "1";
};

isLogged = function(webView) {
  var result;
  result = webView.evalJS("(document.querySelector(\".oauth-message\") !== null)");
  return result === "true";
};

loadNotices = function() {
  return $.rootWebView.setUrl(NOTICES_URL);
};

loadLogin = function() {
  return $.rootWebView.setUrl("https://www.hatena.ne.jp/login?location=http%3A%2F%2Fwww.hatena.ne.jp%2Fnotify%2Fnotices.php");
};

loadLogout = function() {
  return $.rootWebView.setUrl("https://www.hatena.ne.jp/logout?location=http%3A%2F%2Fwww.hatena.ne.jp%2Fnotify%2Fnotices.php");
};

isAuthUrl = function(url) {
  return url.indexOf("https://www.hatena.ne.jp/log") > -1;
};

isOpenInRootWindow = function(url) {
  return isAuthUrl(url) || url.indexOf(NOTICES_URL) > -1;
};

hasCookie = function(webView) {
  return webView.evalJS("/^.*rk=(.*?);.*$/.test(document.cookie)") === "true";
};

getCookie = function(webView) {
  if (hasCookie(webView)) {
    return webView.evalJS("document.cookie.replace(/^.*rk=(.*?);.*$/, \"$1\")");
  }
};

openPreview = function(url) {
  if (OS_IOS) {
    $.contents.url = url;
    return $.preview.open({
      modal: true
    });
  } else if (OS_ANDROID) {
    debugger;
    return Ti.Platform.openURL(url);
  }
};

onLoadError = function(ev) {
  alert(ev.message);
  return $.rootWebView.stopLoading();
};

bindWebView = function(webView) {
  webView.addEventListener("load", load);
  webView.addEventListener("error", onLoadError);
  return webView.addEventListener("beforeload", beforeload);
};

bindAppEvents = function() {
  return Ti.App.addEventListener("pause", function() {
    if (OS_IOS) {
      registerIOSBackgroungTask();
    }
    if (OS_ANDROID) {
      return startAndroidService();
    }
  });
};

registerIOSBackgroungTask = function() {
  var service;
  service = Ti.App.iOS.registerBackgroundService({
    url: "background.js"
  });
  return Ti.App.addEventListener("resume", function() {
    service.stop();
    Ti.UI.iPhone.appBadge = 0;
    return loadNotices();
  });
};

dismissPreview = function(e) {
  return $.preview.close();
};

onAdError = function(e) {
  debugger;
};

startAndroidService = function(e) {
  var cookie, intent, service;
  cookie = getCookie($.rootWebView);
  if (!cookie) {
    return;
  }
  intent = Ti.Android.createServiceIntent({
    url: "background.js"
  });
  intent.putExtra("interval", 5 * 1000);
  intent.putExtra("cookie", cookie);
  service = Ti.Android.createService(intent);
  Ti.App.addEventListener("resume", function() {
    service.stop();
    Ti.App.Properties.removeProperty("notificationCount");
    return loadNotices();
  });
  if (!Ti.Android.isServiceRunning(intent)) {
    return service.start();
  }
};

insertAndroidAdView = function() {
  var ad;
  ad = require('ti.admob').createView({
    testing: true,
    publisherId: 'a151db81fcc9be9'
  });
  $.adAndroid.add(ad);
  return $.rootWebView.applyProperties({
    top: $.adAndroid.height,
    height: $.rootWebView.height - $.adAndroid.height
  });
};

NOTICES_URL = "http://www.hatena.ne.jp/notify/notices.php";

bindAppEvents();

bindWebView($.rootWebView);

loadNotices();

$.index.open();