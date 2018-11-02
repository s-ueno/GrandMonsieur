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
        public get AllowSearchBilibili(): boolean {
            return $.GetLocalStorage("bilibili", true);
        }

        public get LastResponseFromYoutube(): any {
            return $.GetLocalStorage("LastResponseFromYoutube", {});
        }
        public set LastResponseFromYoutube(value: any) {
            $.SetLocalStorage("LastResponseFromYoutube", value);
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

        public BilibiliList: DomBehind.Data.ListCollectionView;
        protected NextBilibiliListAction: Function;


        public WatchedList: Array<MovieInfo>;
        Initialize(): void {
            // ポータルから検索イベントをサブスクライブ
            AppMediator.SearchEvent.AddHandler((sender, e) => this.OnSearch(e));
            AppMediator.TargetSiteChanged.Clear();
            AppMediator.TargetSiteChanged.AddHandler((sender, e) => this.UpdateTarget());

            (<HomeView>this.View).Select(this.Sort, this.Result);

            let table = this.GetTable(MovieInfo);
            table.List().done(x => this.WatchedList = x);

            this.Search(true);
        }

        private OnSearch(e: { search: string; site: SupportSites; }) {
            if (!this.IsVisible) return;

            if (e.search !== this.oldNiconicoSearchValue) {
                this.niconicoPageToken = 0;
            }
            this.oldNiconicoSearchValue = e.search;
            if (e.search !== this.oldBilibiliSearchValue) {
                this.bilibiliPageToken = 0;
            }
            this.oldBilibiliSearchValue = e.search;
            this.SearchRaw(e.search, e.site);
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
                let newRow: MovieInfo = {
                    Title: title,
                    Thumbnail: value.ThumbnailUri,
                    Duration: value.Duration,
                    Owner: owner,
                    Views: value.ViewCount,
                    UpdateDate: value.PublishedAt,
                    Uri: value.Uri,
                    Source: value,
                    MovieStatus: MovieStatus.None,
                }
                if (this.WatchedList) {
                    let row = this.WatchedList.FirstOrDefault(x => x.Uri === value.Uri)
                    if (row) {
                        newRow.LastUpdateDate = row.LastUpdateDate;
                        if (row.MovieStatus)
                            newRow.MovieStatus = row.MovieStatus;
                    }
                }
                list.add(newRow);
            });
            let result: any = new DomBehind.Data.ListCollectionView(list.toArray());
            result.PageToken = response.PageToken;
            return result
        }

        protected SearchAll(search: string) {
            // hack
            this.SearchRaw(search, SupportSites.All);
        }
        protected SearchRaw(search: string, site: SupportSites, pageToken?: any) {
            NProgress.start();

            return $.when(
                this.ExecuteAjax(site & SupportSites.Youtube, search, pageToken).done(x => {
                    this.YoutubeList = this.CreateListCollectionView(x.Response);
                    this.LastResponseFromYoutube = x.Response;
                    this.UpdateTarget();
                    this.NextYoutubeListAction = () => this.SearchRaw(search, SupportSites.Youtube, x.Response.PageToken);
                }).fail(error => {
                    if (this.LastResponseFromYoutube) {
                        this.YoutubeList = this.CreateListCollectionView(this.LastResponseFromYoutube);
                        this.UpdateTarget();
                    }
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
                }),
                this.ExecuteAjax(site & SupportSites.Bilibili, search, pageToken).done(x => {
                    this.BilibiliList = this.CreateListCollectionView(x.Response);
                    this.UpdateTarget();
                    this.NextBilibiliListAction = () => {
                        if (search === this.oldBilibiliSearchValue) {
                            this.bilibiliPageToken += 1;
                        } else {
                            this.bilibiliPageToken = 0;
                        }
                        this.SearchRaw(search, SupportSites.Bilibili, this.bilibiliPageToken);
                    };
                })
            ).always(() => NProgress.done());
        }
        private oldNiconicoSearchValue: string;
        private niconicoPageToken: number = 0;

        private oldBilibiliSearchValue: string;
        private bilibiliPageToken: number = 0;

        private ExecuteAjax(site: SupportSites, query: string, pageToken?: any): JQueryPromise<any> {
            let svc = new SearchWebProxy();
            return svc.ExecuteAjax({
                VideoType: site,
                Filter: query,
                SortList: this.Sort,
                SearchCount: this.Result,
                PageToken: pageToken,
            }).fail(error => {




            });
        }

        public More() {
            this.NextYoutubeListAction();
            this.NextDailymotionListAction();
            this.NextNiconicoListAction();
            this.NextBilibiliListAction();
        }

        public Download(e: MovieInfo) {
            e.LastUpdateDate = new Date();
            e.MovieStatus = MovieStatus.DownloadQueue;
            this.AddDownloadList(e);
        }

        public Play(e: MovieInfo) {
            e.LastUpdateDate = new Date();
            if (e.MovieStatus !== MovieStatus.Downloaded)
                e.MovieStatus = MovieStatus.Watched;

            if (this.WatchedList && !this.WatchedList.Any(x => x.Uri === e.Uri)) {
                this.WatchedList.push(e);
            }
            this.PlayRaw(e);
        }
    }
}