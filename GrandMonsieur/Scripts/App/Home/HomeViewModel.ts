namespace GrandMonsieur.Home {
    export class HomeViewModel extends AppViewModel {

        public get AllowSearchYoutube(): boolean {
            return $.GetLocalStorage("YouTube", true);
        }
        public get AllowSearchDaily(): boolean {
            return $.GetLocalStorage("dailymotion", true);
        }
        public get AllowSearchNiconico(): boolean {
            return $.GetLocalStorage("niconico", true);
        }

        public get Sort(): string {
            return $.GetLocalStorage("Sort", "Relevance");
        }
        public set Sort(value: string) {
            $.SetLocalStorage("Sort", value);
        }

        public get Result(): number {
            return $.GetLocalStorage("Result", 15);
        }
        public set Result(value: number) {
            $.SetLocalStorage("Result", value);
        }

        public YoutubeList: DomBehind.Data.ListCollectionView;
        public DailymotionList: DomBehind.Data.ListCollectionView;
        public NiconicoList: DomBehind.Data.ListCollectionView;

        Initialize(): void {
            // ポータルから検索イベントをサブスクライブ
            AppMediator.SearchEvent.Clear();
            AppMediator.SearchEvent.AddHandler((sender, e) => this.SearchRaw(e.search, e.site));

            AppMediator.TargetSiteChanged.Clear();
            AppMediator.TargetSiteChanged.AddHandler((sender, e) => this.UpdateTarget());

            (<HomeView>this.View).Sort(this, this.Sort);
        }

        public Search() {
            let history = this.GetTable(SearchHistory);
            history.List().done(x => {
                if (x instanceof Array) {
                    let last = x.OrderByDecording(x => x.UpdateDate).FirstOrDefault();
                    if (last) {
                        this.SearchAll(last.Filter);
                    }
                    else {
                        this.SearchAll(null);
                    }
                }
            }).fail(() => {
                this.SearchAll(null);
            });
        }

        protected CreateListCollectionView(response) {
            let list = new DomBehind.List<MovieInfo>();

            $.each(response.Items, (i, value) => {
                let title: string = value.Title;
                if (40 < title.length) {
                    title = title.substring(0, 40) + "...";
                }
                let owner: string = value.CreateUser;
                if (owner && 20 < owner.length) {
                    owner = owner.substr(0, 20) + "...";
                }
                list.add({
                    Title: title,
                    Thumbnail: value.ThumbnailUri,
                    Duration: value.Duration,
                    Owner: owner,
                    Views: value.ViewCount,
                    UpdateDate: value.PublishedAt,
                    Uri: value.Uri,
                    Source: value,
                });
            });

            return new DomBehind.Data.ListCollectionView(list.toArray());
        }

        protected SearchAll(search: string) {
            // hack
            this.SearchRaw(search, SupportSites.Youtube | SupportSites.Dailymotion | SupportSites.NicoNico);
        }
        protected SearchRaw(search: string, site: SupportSites) {
            NProgress.start();
            return $.when(
                this.ExecuteAjax(site & SupportSites.Youtube, search).done(x => {
                    this.YoutubeList = this.CreateListCollectionView(x.Response)
                    this.UpdateTarget();
                }),
                this.ExecuteAjax(site & SupportSites.Dailymotion, search).done(x => {
                    this.DailymotionList = this.CreateListCollectionView(x.Response);
                    this.UpdateTarget();
                }),
                this.ExecuteAjax(site & SupportSites.NicoNico, search).done(x => {
                    this.NiconicoList = this.CreateListCollectionView(x.Response);
                    this.UpdateTarget();
                })
            ).always(() => NProgress.done());
        }
        private ExecuteAjax(site: SupportSites, query: string): JQueryPromise<any> {
            let type = -1;
            if (site === SupportSites.Youtube)
                type = 0;
            if (site === SupportSites.Dailymotion)
                type = 1;
            if (site === SupportSites.NicoNico)
                type = 2;

            if (site === -1) {
                let d = $.Deferred();
                d.resolve();
                return d.promise();
            }

            let svc = new SearchWebProxy();
            return svc.ExecuteAjax({
                VideoType: type,
                Filter: query,
                SortList: this.Sort,
                SearchCount: this.Result,
            });
        }

        public More() {



        }


        public Download(e: MovieInfo) {
            this.AddDownloadList(e);
        }

        public Play(e: MovieInfo) {
            this.PlayRaw(e);
        }
    }
}