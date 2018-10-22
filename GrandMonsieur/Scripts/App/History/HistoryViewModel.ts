namespace GrandMonsieur.History {
    export class HistoryViewModel extends AppViewModel {

        public History: DomBehind.Data.ListCollectionView;
        Initialize(): void {
            AppMediator.SearchEvent.AddHandler((sender, e) => this.OnSearch(e));
        }
        private OnSearch(e: { search: string; site: SupportSites; }) {
            if (!this.IsVisible) return;

            this.History.Filter = (x: MovieInfo) => x.Title.toLowerCase().Contains(e.search.toLowerCase());
            this.History.Refresh();
        }
        public Activate() {
            NProgress.start();

            let history = this.GetTable(MovieInfo);
            history.List().done(x => {
                if (x instanceof Array) {
                    let ordered = x.OrderByDecording(x => x.LastUpdateDate);
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
