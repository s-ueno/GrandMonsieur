namespace GrandMonsieur.Home {
    export class HomeViewModel extends AppViewModel {

        public YoutubeList: DomBehind.Data.ListCollectionView;
        public DailymotionList: DomBehind.Data.ListCollectionView;
        public NiconicoList: DomBehind.Data.ListCollectionView;

        Initialize(): void {
            // ポータルから検索イベントをサブスクライブ
            AppMediator.SearchEvent.Clear();
            AppMediator.SearchEvent.AddHandler((sender, e) => this.Search(e.search, e.site));

            let history = this.GetTable(SearchHistory);
            history.List().done(x => {

                if (x instanceof Array) {
                    let last = x.OrderByDecording(x => x.UpdateDate).FirstOrDefault();
                    if (last) {
                        this.SearchAll(last.Filter);
                    } else {
                        this.InitializeRaw();
                    }
                }
            }).fail(() => {
                this.InitializeRaw();
            });
        }
        protected InitializeRaw() {
            NProgress.start();

            let youtube = new InitializeWebProxy();
            let d1 = youtube.ExecuteAjax({
                VideoType: 0
            }).done(x => {
                this.YoutubeList = this.CreateListCollectionView(x.Response);
            }).fail(error => {
                this.ShowError(error);
            }).always(() => {
                this.UpdateTarget();
            });


            let daily = new InitializeWebProxy();
            let d2 = daily.ExecuteAjax({
                VideoType: 1
            }).done(x => {
                this.DailymotionList = this.CreateListCollectionView(x.Response);
            }).fail(error => {
                this.ShowError(error);
            }).always(() => {
                this.UpdateTarget();
            });



            let niconico = new InitializeWebProxy();
            let d3 = niconico.ExecuteAjax({
                VideoType: 2
            }).done(x => {
                this.NiconicoList = this.CreateListCollectionView(x.Response);
            }).fail(error => {
                this.ShowError(error);
            }).always(() => {
                this.UpdateTarget();
            });

            // 会社でやったら、プロキシでひっかかった（汗
            //let d = $.Deferred();
            //d.resolve();
            //let d3 = d.promise();
            


            $.when(d1, d2, d3).always(() => {
                NProgress.done();
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
            this.Search(search, SupportSites.Youtube | SupportSites.Dailymotion | SupportSites.NicoNico);
        }
        protected Search(search: string, site: SupportSites) {
            NProgress.start();

            let d1 = $.Deferred();
            if (site & SupportSites.Youtube) {
                let svc = new SearchWebProxy();
                svc.ExecuteAjax({ VideoType: 0, Filter: search }).done(x => {
                    this.YoutubeList = this.CreateListCollectionView(x.Response);
                }).fail(x => {
                    // this.ShowError(x);
                    console.error(x);
                }).always(() => {
                    d1.resolve();
                    this.UpdateTarget();
                });
            } else {
                d1.resolve();
            }

            let d2 = $.Deferred();
            if (site & SupportSites.Dailymotion) {
                let svc = new SearchWebProxy();
                svc.ExecuteAjax({ VideoType: 1, Filter: search }).done(x => {
                    this.DailymotionList = this.CreateListCollectionView(x.Response);
                }).fail(x => {
                    // this.ShowError(x);
                    console.error(x);
                }).always(() => {
                    d2.resolve();
                    this.UpdateTarget();
                });
            } else {
                d2.resolve();
            }


            let d3 = $.Deferred();
            if (site & SupportSites.NicoNico) {
                let svc = new SearchWebProxy();
                svc.ExecuteAjax({ VideoType: 2, Filter: search }).done(x => {
                    this.NiconicoList = this.CreateListCollectionView(x.Response);
                }).fail(x => {
                    // this.ShowError(x);
                    console.error(x);
                }).always(() => {
                    d3.resolve();
                    this.UpdateTarget();
                });
            } else {
                d3.resolve();
            }

            return $.when(d1.promise(), d2.promise(), d3.promise()).always(() => {
                NProgress.done();
            });
        }


        public Download(e: MovieInfo) {
            this.DownloadRaw(e);
        }

        public Play(e: MovieInfo) {
            this.PlayRaw(e);
        }
    }
}