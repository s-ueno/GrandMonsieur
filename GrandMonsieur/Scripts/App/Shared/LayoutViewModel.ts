namespace GrandMonsieur.Shared {
    export class LayoutViewModel extends AppViewModel {
        public UserName: string;

        Initialize(): void {
            this.Title = "Grand Monsieur";

            let history = this.GetTable(SearchHistory);
            history.List().done(x => {
                if (x instanceof Array) {
                    let last = x.OrderByDecording(x => x.UpdateDate).FirstOrDefault();
                    if (last) {
                        this.SearchString = last.Filter;
                        this.UpdateTarget();
                    }
                }
            });
        }

        public Refresh() {
            this.Navigator.Reload(true);
        }

        public SearchString: string;
        public Search() {
            this.UpdateSource();

            if (String.IsNullOrWhiteSpace(this.SearchString)) return;

            //if (location.href !== $.AbsoluteUri("home")) {
            //    this.Home();
            //}

            let history = this.GetTable(SearchHistory);
            let pms = history.FindRowAsync(x => x.Filter, this.SearchString);
            pms.done(x => {
                if (x) {
                    x.UpdateDate = new Date();
                    history.UpsertAsync(x, x => x.Filter);
                } else {
                    let newHistory = new SearchHistory();
                    newHistory.Filter = this.SearchString;
                    newHistory.UpdateDate = new Date();
                    history.UpsertAsync(newHistory, x => x.Filter);
                }
            }).fail(() => {
                let newHistory = new SearchHistory();
                newHistory.Filter = this.SearchString;
                newHistory.UpdateDate = new Date();
                history.UpsertAsync(newHistory, x => x.Filter);
            }).always(() => {
                AppMediator.SearchEvent.Raise(this, {
                    search: this.SearchString,
                    site: SupportSites.Youtube | SupportSites.Dailymotion | SupportSites.NicoNico
                });
            });
        }

    }
}