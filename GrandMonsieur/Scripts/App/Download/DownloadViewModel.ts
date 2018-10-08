namespace GrandMonsieur.Download {


    export class DownloadViewModel extends AppViewModel {

        public History: DomBehind.Data.ListCollectionView;
        Initialize(): void {
            AppMediator.Starting.AddHandler((sender, e) => this.OnNorification(e));
            AppMediator.Downloading.AddHandler((sender, e) => this.OnNorification(e));
            AppMediator.ErrorLogging.AddHandler((sender, e) => this.OnNorification(e));
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
                    let ordered = x.OrderByDecording(x => x.LastPlayDate);
                    this.History = new DomBehind.Data.ListCollectionView(ordered);

                }
            }).always(() => {
                NProgress.done();
                this.UpdateTarget();
            });
        }

        public Download(e: DownloadInfo) {
            e.Status = DownloadStatus.Doing;
            e.NotifyInfomation = "Please wait...";
            return DownloadRequest(e.Uri).done((x: { Uri, Path, Name }) => {
                e.Status = DownloadStatus.Done;
                e.NotifyInfomation = "complate!!";
                e.DownloadUri = x.Path;
                e.DownloadUriAlias = x.Name;
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
