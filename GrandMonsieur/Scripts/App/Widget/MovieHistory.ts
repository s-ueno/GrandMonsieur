//namespace DomBehind {

//    export class MovieHistoryBindingBehavior extends Data.DataBindingBehavior {
//        public static ItemSource = Data.DependencyProperty.RegisterAttached("movie.itemsource",
//            el => {
//                // oneway
//            },
//            (el, newValue, caller) => {
//                if (caller instanceof MovieHistoryBindingBehavior) {
//                    caller.Render(el, newValue);
//                }
//            },
//            Data.UpdateSourceTrigger.Explicit,
//            Data.BindingMode.OneWay);

//        private static readonly template: string =
//            '<div class="row">' +
//            '    <div class="col-md-3">' +
//            '        <div class="thumbnail" style="min-width:240px; min-height:135px">' +
//            '            <div class="image view view-first" style="height:100%; width:100%">' +
//            '                <img class="movie_thumbnail" style="width: 100%; display: block; height:100%" src="" />' +
//            '                <div class="mask parent-size">' +
//            '                    <div class="tools">' +
//            '                        <a class="movie_play"><i class="fa fa-play"></i> play </a>' +
//            '                        <a class="movie_download"><i class="fa fa-download"></i> download </a>' +
//            '                    </div>' +
//            '                </div>' +
//            '                <label class="movie_duration mask" style="opacity:1; width:auto; display:flex; background-color:black; color:white; padding:0 2px;">4:30</label>' +
//            '            </div>' +
//            '        </div>' +
//            '    </div>' +
//            '    <div class="col-md-9">' +
//            '        <div class="">' +
//            '            <h4 class="movie_title">2008 Honda Inspaire 35il cp3</h4>' +
//            '        </div>' +
//            '        <div class="">' +
//            '            <label class="movie_owner">Hikakin TV</label>' +
//            '        </div>' +
//            '        <div class="">' +
//            '            <label class="movie_views">466 views</label>' +
//            '        </div>' +
//            '        <div class="" style="padding-top:15px">' +
//            '            <div class="progress progress_sm movie_progress" style="width: 100%;display:none"></div>' +
//            '        </div>' +
//            '    </div>' +
//            '    <iframe class="movie_frame" src="" style="display:none"></iframe>' +
//            '</div>';

//        protected Render(element: JQuery, newValue: any) {
//            if (!element) return;
//            element.empty();
//            if (newValue instanceof Data.ListCollectionView) {
//                let me: MovieHistoryBindingBehavior = this;
//                $.each(newValue.ToArray(), (i, value) => {

//                    let dom = $(MovieHistoryBindingBehavior.template);
//                    let identity = NewUid();
//                    dom.attr("id", `Movie_${identity}`);
//                    value.__dom = dom;

//                    dom.find(".movie_thumbnail").attr("src", this.ThumbnailExpression(value));
//                    dom.find(".movie_duration").text(this.DurationExpression(value));
//                    dom.find(".movie_title").text(this.TitleExpression(value));
//                    dom.find(".movie_owner").text(this.OwnerExpression(value));
//                    dom.find(".movie_views").text(this.ViewsExpression(value));
//                    dom.find(".movie_publish").text(this.UpdateDateExpression(value));

//                    dom.find(".movie_play").attr("href", "javascript:void(0);").on("click", e => this.Play(this.DataContext, value));
//                    dom.find(".movie_download").attr("href", "javascript:void(0);").on("click", e => this.Download(this.DataContext, value));

//                    // hack
//                    if (this.AllowDownload) {
//                        let progress = dom.find(".movie_progress").progressbar({
//                            max: 100,
//                            value: 0
//                        });
//                        progress.show();

//                        //let id = setInterval(() => {
//                        //    let value = Number(progress.progressbar("value"));
//                        //    progress.progressbar("value", ++value);
//                        //    if (100 === value) {
//                        //        clearInterval(id);
//                        //        return;
//                        //    }
//                        //}, 100);
//                    }

//                    element.append(dom);
//                });
//            }
//        }

//        public SiteTitle: string;
//        public SiteImageUri: string;

//        public ThumbnailExpression: (owner: any) => string;
//        public DurationExpression: (owner: any) => string;
//        public TitleExpression: (owner: any) => string;
//        public OwnerExpression: (owner: any) => string;
//        public ViewsExpression: (owner: any) => string;
//        public UpdateDateExpression: (owner: any) => string;
//        public Download: (owner: any, source: any) => void;
//        public Play: (owner: any, source: any) => void;


//        public AllowDownload: boolean;
        
//    }

//    export class MovieHistoryBindingBehaviorBuilder<T> extends BindingBehaviorBuilder<T>{
//        constructor(owner: BizView) {
//            super(owner);
//        }


//        public BindingThumbnail(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieHistoryBindingBehavior) {
//                this.CurrentBehavior.ThumbnailExpression = exp;
//            }
//            return this;
//        }
//        public BindingDuration(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieHistoryBindingBehavior) {
//                this.CurrentBehavior.DurationExpression = exp;
//            }
//            return this;
//        }
//        public BindingTitle(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieHistoryBindingBehavior) {
//                this.CurrentBehavior.TitleExpression = exp;
//            }
//            return this;
//        }

//        public BindingOwner(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieHistoryBindingBehavior) {
//                this.CurrentBehavior.OwnerExpression = exp;
//            }
//            return this;
//        }
//        public BindingViews(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieHistoryBindingBehavior) {
//                this.CurrentBehavior.ViewsExpression = exp;
//            }
//            return this;
//        }
//        public BindingUpdateDate(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieHistoryBindingBehavior) {
//                this.CurrentBehavior.UpdateDateExpression = exp;
//            }
//            return this;
//        }
//    }

//    export interface BindingBehaviorBuilder<T> {
//        BindingMovieHistory<TRow>(itemSource: (x: T) => any,
//            option?: {
//                download?: (owner: T, source: any) => void,
//                play?: (owner: T, source: any) => void,
//                downloadprogress?: boolean,
//            }): MovieHistoryBindingBehaviorBuilder<TRow>;
//    }

//    BindingBehaviorBuilder.prototype.BindingMovieHistory = function (
//        itemSource: (x: any) => any, option?: {
//            download?: (owner: any, source: any) => void,
//            play?: (owner: any, source: any) => void,
//            allowDownload?: boolean,
//        }) {

//        let me: BindingBehaviorBuilder<any> = this;
//        let behavior = me.Add(new MovieHistoryBindingBehavior());

//        behavior.Property = MovieHistoryBindingBehavior.ItemSource;
//        behavior.PInfo = new LamdaExpression(me.Owner.DataContext, itemSource);
//        if (option && option.download) {
//            behavior.Download = option.download;
//        }
//        if (option && option.play) {
//            behavior.Play = option.play;
//        }
//        if (option && option.allowDownload) {
//            behavior.AllowDownload = true;
//        }

//        let newMe = new MovieHistoryBindingBehaviorBuilder<any>(me.Owner);
//        newMe.CurrentElement = me.CurrentElement;
//        newMe.CurrentBehavior = me.CurrentBehavior;
//        return newMe;
//    }

//}