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
    __proxy.invoke("RequestDownload", uri, title, soundOnly)
        .done(e => d.resolve(e))
        .fail(e => d.reject(e));
    return d.promise();
}
