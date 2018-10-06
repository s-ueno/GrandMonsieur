namespace GrandMonsieur.Download {
    export class DownloadViewModel extends AppViewModel {

        public History: DomBehind.Data.ListCollectionView;
        Initialize(): void {
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
