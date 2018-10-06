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
            let value = $.GetLocalStorage("Sort", "Relevance");
            if (["Relevance", "Date", "ViewCount", "Rating", "Title"].Any(x => x === value)) {
                return value;
            }
            return this.Sort = "Relevance";
        }
        public set Sort(value: string) {
            $.SetLocalStorage("Sort", value);
        }

        public get Result(): number {
            let value = $.GetLocalStorage("Result", 15);
            if ([10, 15, 30, 50].Any(x => x === value)) {
                return value;
            }
            return this.Result = 15;
        }
        public set Result(value: number) {
            $.SetLocalStorage("Result", value);
        }

        public YoutubeList: DomBehind.Data.ListCollectionView;
        protected NextYoutubeListAction: Function;

        public DailymotionList: DomBehind.Data.ListCollectionView;
        protected NextDailymotionListAction: Function;

        public NiconicoList: DomBehind.Data.ListCollectionView;
        protected NextNiconicoListAction: Function;

        public WatchedList: Array<MovieInfo>;
        Initialize(): void {
            // ポータルから検索イベントをサブスクライブ
            AppMediator.SearchEvent.Clear();
            AppMediator.SearchEvent.AddHandler((sender, e) => {
                if (e.search !== this.oldNiconicoSearchValue) {
                    this.niconicoPageToken = 0;
                }
                this.oldNiconicoSearchValue = e.search;

                this.SearchRaw(e.search, e.site);
            });

            AppMediator.TargetSiteChanged.Clear();
            AppMediator.TargetSiteChanged.AddHandler((sender, e) => this.UpdateTarget());

            (<HomeView>this.View).Select(this.Sort, this.Result);

            let table = this.GetTable(MovieInfo);
            table.List().done(x => this.WatchedList = x);

            this.Search(true);
        }

        public Search(init: boolean = false) {
            let history = this.GetTable(SearchHistory);
            history.List().done(x => {
                if (x instanceof Array) {
                    let last = x.OrderByDecording(x => x.UpdateDate).FirstOrDefault();
                    if (last) {
                        if (init)
                            this.oldNiconicoSearchValue = last.Filter;
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

        protected CreateListCollectionView(response): DomBehind.Data.ListCollectionView {
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
                    IsWatched: this.IsWatched(value.Uri),
                });
            });
            let result: any = new DomBehind.Data.ListCollectionView(list.toArray());
            result.PageToken = response.PageToken;
            return result
        }
        protected IsWatched(uri: string): boolean {
            if (this.WatchedList) {
                return this.WatchedList.Any(x => x.Uri === uri);
            }
            return false;
        }

        protected SearchAll(search: string) {
            // hack
            this.SearchRaw(search, SupportSites.Youtube | SupportSites.Dailymotion | SupportSites.NicoNico);
        }
        protected SearchRaw(search: string, site: SupportSites, pageToken?: any) {
            NProgress.start();
            return $.when(
                this.ExecuteAjax(site & SupportSites.Youtube, search, pageToken).done(x => {
                    this.YoutubeList = this.CreateListCollectionView(x.Response);
                    this.UpdateTarget();
                    this.NextYoutubeListAction = () => this.SearchRaw(search, SupportSites.Youtube, x.Response.PageToken);
                }),
                this.ExecuteAjax(site & SupportSites.Dailymotion, search, pageToken).done(x => {
                    this.DailymotionList = this.CreateListCollectionView(x.Response);
                    this.UpdateTarget();
                    this.NextDailymotionListAction = () => this.SearchRaw(search, SupportSites.Dailymotion, x.Response.PageToken);
                }),
                this.ExecuteAjax(site & SupportSites.NicoNico, search, pageToken).done(x => {
                    this.NiconicoList = this.CreateListCollectionView(x.Response);
                    this.UpdateTarget();
                    this.NextNiconicoListAction = () => {
                        if (search === this.oldNiconicoSearchValue) {
                            this.niconicoPageToken += this.Result;
                        } else {
                            this.niconicoPageToken = 0;
                        }
                        this.SearchRaw(search, SupportSites.NicoNico, this.niconicoPageToken);
                    };
                })
            ).always(() => NProgress.done());
        }
        private oldNiconicoSearchValue: string;
        private niconicoPageToken: number = 0;


        private ExecuteAjax(site: SupportSites, query: string, pageToken?: any): JQueryPromise<any> {
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
                PageToken: pageToken,
            });
        }

        public More() {
            this.NextYoutubeListAction();
            this.NextDailymotionListAction();
            this.NextNiconicoListAction();
        }

        public Download(e: MovieInfo) {
            this.AddDownloadList(e);
        }

        public Play(e: MovieInfo) {
            e.IsWatched = true;
            if (this.WatchedList) {
                this.WatchedList.push(e);
            }

            this.PlayRaw(e);
        }
    }
}