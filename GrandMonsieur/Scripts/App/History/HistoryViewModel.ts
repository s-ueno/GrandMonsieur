namespace GrandMonsieur.History {
    export class HistoryViewModel extends AppViewModel {

        public History: DomBehind.Data.ListCollectionView;
        Initialize(): void {

        }
        public Activate() {
            NProgress.start();

            let history = this.GetTable(MovieInfo);
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

        public Download(e: MovieInfo) {
            this.AddDownloadList(e);
        }

        public Play(e: MovieInfo) {
            this.PlayRaw(e);
        }

        public ClearHistory() {
            this.ShowOkCancel("Are you sure you want to delete all playlists?", "", {
                okCallback: () => {
                    let history = this.GetTable(MovieInfo);
                    history.Truncate().always(() => {
                        this.History = new DomBehind.Data.ListCollectionView([]);
                        this.UpdateTarget();
                    });
                }
            });

        }

    }
}
