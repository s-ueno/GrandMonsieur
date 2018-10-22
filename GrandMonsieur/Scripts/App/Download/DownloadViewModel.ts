namespace GrandMonsieur.Download {


    export class DownloadViewModel extends AppViewModel {

        public History: DomBehind.Data.ListCollectionView;
        Initialize(): void {
            AppMediator.SearchEvent.AddHandler((sender, e) => this.OnSearch(e));
            AppMediator.Starting.AddHandler((sender, e) => this.OnNorification(e));
            AppMediator.Downloading.AddHandler((sender, e) => this.OnNorification(e));
            AppMediator.ErrorLogging.AddHandler((sender, e) => this.OnNorification(e));
        }
        private OnSearch(e: { search: string; site: SupportSites; }) {
            if (!this.IsVisible) return;

            this.History.Filter = (x: DownloadInfo) => x.Title.toLowerCase().Contains(e.search.toLowerCase());
            this.History.Refresh();
        }

        private OnNorification(e: { uri: string; message: string; }) {
            let target = this.GetDownloadInfo(e.uri);
            if (target) {
                setTimeout(() => {
                    target.NotifyInfomation = e.message;
                }, 10);
            }
        }

        protected GetDownloadInfo(uri: string): DownloadInfo {
            if (!this.History) return null;
            let arr: Array<DownloadInfo> = this.History.ToArray();
            if (!arr || arr.length === 0) return null;

            return arr.FirstOrDefault(x => x.Uri === uri);
        }

        public Activate() {
            NProgress.start();

            let history = this.GetTable(DownloadInfo);
            history.List().done(x => {
                if (x instanceof Array) {
                    let ordered: Array<DownloadInfo> = x;
                    try {
                        ordered = x.OrderByDecording(x => x.LastUpdateDate);
                    } catch (e) {
                    }
                    this.History = new DomBehind.Data.ListCollectionView(ordered);
                }
            }).always(() => {
                NProgress.done();
                this.UpdateTarget();
            });
        }

        public Download(e: DownloadInfo, soundOnly: boolean) {
            e.Status = DownloadStatus.Doing;
            e.NotifyInfomation = "Please wait...";
            return DownloadRequest(e.Uri, e.Title, soundOnly).done((x: { Uri, Path, Message }) => {
                e.Status = DownloadStatus.Done;
                e.NotifyInfomation = "ready!!";
                e.DownloadUri = x.Path;
                e.DownloadUriAlias = x.Message;
                e.MovieStatus = MovieStatus.Downloaded;
                let el: JQuery = (<any>e).__element;
                if (el) {
                    let downloadLink = el.find(".movie_downloadLink");
                    if (0 < downloadLink.length) {
                        setTimeout(() => downloadLink[0].click(), 100);
                    }
                }

                let table = this.GetTable(DownloadInfo);
                table.UpsertAsync(DownloadInfo.Clone(e), x => x.Uri);

            }).fail(x => {
                e.Status === DownloadStatus.None;
            });
        }

        public Play(e: DownloadInfo) {
            this.PlayRaw(e);
        }

        public ClearHistory() {
            this.ShowOkCancel("Are you sure you want to delete all download list?", "", {
                okCallback: () => {
                    let history = this.GetTable(DownloadInfo);
                    history.Truncate().always(() => {
                        this.History = new DomBehind.Data.ListCollectionView([]);
                        this.UpdateTarget();
                    });
                }
            });

        }

    }
}
