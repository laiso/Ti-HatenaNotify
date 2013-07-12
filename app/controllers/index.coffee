beforeload = (ev) ->
  if OS_IOS and not isOpenInRootWindow(ev.url)
#  unless isOpenInRootWindow(ev.url)
    $.rootWebView.stopLoading()
    openPreview ev.url

load = (ev) ->
  if isFailedToContentLoad(ev.source)
    loadLogin()
  return
  loadNotices()  if isAuthUrl(ev.url) and isLogged(ev.source)

isFailedToContentLoad = (webView) ->
  webView.evalJS("document.body.childNodes.length") is "1"

isLogged = (webView) ->
  result = webView.evalJS("(document.querySelector(\".oauth-message\") !== null)")
  result is "true"

loadNotices = ->
  $.rootWebView.setUrl NOTICES_URL

loadLogin = ->
  $.rootWebView.setUrl "https://www.hatena.ne.jp/login?location=http%3A%2F%2Fwww.hatena.ne.jp%2Fnotify%2Fnotices.php"

loadLogout = ->
  $.rootWebView.setUrl "https://www.hatena.ne.jp/logout?location=http%3A%2F%2Fwww.hatena.ne.jp%2Fnotify%2Fnotices.php"

isAuthUrl = (url) ->
  url.indexOf("https://www.hatena.ne.jp/log") > -1

isOpenInRootWindow = (url) ->
  isAuthUrl(url) or url.indexOf(NOTICES_URL) > -1

hasCookie = (webView) ->
  webView.evalJS("/^.*rk=(.*?);.*$/.test(document.cookie)") is "true"

getCookie = (webView) ->
  webView.evalJS "document.cookie.replace(/^.*rk=(.*?);.*$/, \"$1\")"  if hasCookie(webView)

openPreview = (url) ->
  if OS_IOS
    $.contents.url = url
    $.preview.open modal: true
  else if OS_ANDROID
    debugger
    Ti.Platform.openURL url

onLoadError = (ev) ->
  alert ev.message
  $.rootWebView.stopLoading()

bindWebView = (webView) ->
  webView.addEventListener "load", load
  webView.addEventListener "error", onLoadError
  webView.addEventListener "beforeload", beforeload

bindAppEvents = ->
  Ti.App.addEventListener "pause", ->
    registerIOSBackgroungTask() if OS_IOS
    startAndroidService() if OS_ANDROID


# iOS
registerIOSBackgroungTask = ->
  service = Ti.App.iOS.registerBackgroundService(url: "background.js")
  Ti.App.addEventListener "resume", ->
    service.stop()
    Ti.UI.iPhone.appBadge = 0
    loadNotices()

dismissPreview = (e) ->
  $.preview.close()

onAdError = (e) ->
  debugger

# Android
startAndroidService = (e) ->
  cookie = getCookie($.rootWebView)
  return  unless cookie
  intent = Ti.Android.createServiceIntent(url: "background.js")
  intent.putExtra "interval", 5 * 1000
  #  intent.putExtra "interval", 60 * 1000 * 15
  intent.putExtra "cookie", cookie
  service = Ti.Android.createService(intent)
  Ti.App.addEventListener "resume", ->
    service.stop()
    Ti.App.Properties.removeProperty "notificationCount"
    loadNotices()
  service.start() unless Ti.Android.isServiceRunning intent

insertAndroidAdView = ->
  ad = require('ti.admob').createView {
    testing: true, publisherId: 'a151db81fcc9be9'
  }
  $.adAndroid.add ad
  $.rootWebView.applyProperties {top: $.adAndroid.height, height: $.rootWebView.height - $.adAndroid.height}


# main
NOTICES_URL = "http://www.hatena.ne.jp/notify/notices.php"

bindAppEvents()
bindWebView $.rootWebView

loadNotices()
$.index.open()