// entory point
GrandMonsieur.BizApplication.Resolve();

declare var __con: SignalR.Hub.Connection;
declare var __proxy: SignalR.Hub.Proxy;
window.onload = function (e) {
    let uri = $.AbsoluteUri("DownloadHub");
    __con = $.hubConnection(uri);

    __proxy = __con.createHubProxy("Download");
    __proxy.on("Starting", e => {
        GrandMonsieur.AppMediator.Starting.Raise(e, { uri: e.Uri, message: e.Message });
    });
    __proxy.on("Downloading", e => {
        GrandMonsieur.AppMediator.Downloading.Raise(e, { uri: e.Uri, message: e.Message });
    });
    __proxy.on("ErrorLoging", e => {
        GrandMonsieur.AppMediator.ErrorLogging.Raise(e, { uri: e.Uri, message: e.Message });
    });
    __con.start().done(x => { }).fail(x => this.console.error(x));
}
function DownloadRequest(uri: string, title: string, soundOnly: boolean): JQueryPromise<any> {
    let d = $.Deferred();

    if (__proxy.state !== SignalR.ConnectionState.Connected) {
        __con.start().done(x => {
            __proxy.invoke("RequestDownload", uri, title, soundOnly)
                .done(e => d.resolve(e))
                .fail(e => d.reject(e));
        }).fail(x => this.console.error(x));
    } else {
        __proxy.invoke("RequestDownload", uri, title, soundOnly)
            .done(e => d.resolve(e))
            .fail(e => d.reject(e));
    }
    return d.promise();
}



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: "/" })
        .then(function (registration) {
            console.log('Service worker registration succeeded:', registration);
        },
        /*catch*/ function (error) {
                console.log('Service worker registration failed:', error);
            });
} else {
    console.log('Service workers are not supported.');
}