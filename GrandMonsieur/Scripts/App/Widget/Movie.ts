
//namespace DomBehind {


//    export class MovieBindingBehavior extends Data.DataBindingBehavior {
//        public static ItemSource = Data.DependencyProperty.RegisterAttached("movie.itemsource",
//            el => {
//                // oneway
//            },
//            (el, newValue, caller) => {
//                if (caller instanceof MovieBindingBehavior) {
//                    caller.Render(el, newValue);
//                }
//            },
//            Data.UpdateSourceTrigger.Explicit,
//            Data.BindingMode.OneWay);

//        private static readonly template: string =
//            '<div class="col-md-55" style="max-width:220px">' +
//            '    <div class="thumbnail" style="height:220px">' +
//            '        <div class="image view view-first">' +
//            '            <img class="movie_thumbnail" style="width: 100%; display: block;" src=""/>' +
//            '            <div class="mask parent-size">' +
//            '                <div class="tools">' +
//            '                    <a class="movie_play"><i class="fa fa-play"></i> play </a>' +
//            '                    <a class="movie_download"><i class="fa fa-download"></i> download </a>' +
//            '                </div>' +
//            '            </div>' +
//            '            <label class="movie_duration mask" style="opacity:1; width:auto; display:flex; background-color:black; color:white; padding:0 2px"></label>' +
//            '        </div>' +
//            '        <div>' +
//            '            <label class="movie_title" style="font-size: 12px;"></label>' +
//            '        </div>' +
//            '        <div class="vertical-align-bottom" style="width: 100%; padding-bottom: 20px; padding-left:12px; padding-right:12px">' +
//            '            <span class="pull-left movie_owner" style="font-size: 12px;"></span>                        ' +
//            '            <br/>' +
//            '            <span class="pull-right movie_views" style="font-size: 12px;"></span>' +
//            '        </div>' +
//            '    </div>' +
//            '</div>';


//        protected Render(element: JQuery, newValue: any) {
//            if (!element) return;
//            element.empty();
//            if (newValue instanceof Data.ListCollectionView) {
//                let me: MovieBindingBehavior = this;
//                $.each(newValue.ToArray(), (i, value) => {

//                    let dom = $(MovieBindingBehavior.template);
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
//    }

//    export class MovieBindingBehaviorBuilder<T> extends BindingBehaviorBuilder<T>{
//        constructor(owner: BizView) {
//            super(owner);
//        }


//        public BindingThumbnail(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieBindingBehavior) {
//                this.CurrentBehavior.ThumbnailExpression = exp;
//            }
//            return this;
//        }
//        public BindingDuration(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieBindingBehavior) {
//                this.CurrentBehavior.DurationExpression = exp;
//            }
//            return this;
//        }
//        public BindingTitle(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieBindingBehavior) {
//                this.CurrentBehavior.TitleExpression = exp;
//            }
//            return this;
//        }

//        public BindingOwner(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieBindingBehavior) {
//                this.CurrentBehavior.OwnerExpression = exp;
//            }
//            return this;
//        }
//        public BindingViews(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieBindingBehavior) {
//                this.CurrentBehavior.ViewsExpression = exp;
//            }
//            return this;
//        }
//        public BindingUpdateDate(exp: (owner: T) => string) {
//            if (this.CurrentBehavior instanceof MovieBindingBehavior) {
//                this.CurrentBehavior.UpdateDateExpression = exp;
//            }
//            return this;
//        }
//    }

//    export interface BindingBehaviorBuilder<T> {
//        BindingMovies<TRow>(itemSource: (x: T) => any,
//            option?: {
//                download?: (owner: T, source: any) => void,
//                play?: (owner: T, source: any) => void,
//            }): MovieBindingBehaviorBuilder<TRow>;
//    }

//    BindingBehaviorBuilder.prototype.BindingMovies = function (
//        itemSource: (x: any) => any, option?: {
//            download?: (owner: any, source: any) => void,
//            play?: (owner: any, source: any) => void
//        }) {

//        let me: BindingBehaviorBuilder<any> = this;
//        let behavior = me.Add(new MovieBindingBehavior());

//        behavior.Property = MovieBindingBehavior.ItemSource;
//        behavior.PInfo = new LamdaExpression(me.Owner.DataContext, itemSource);
//        if (option && option.download) {
//            behavior.Download = option.download;
//        }
//        if (option && option.play) {
//            behavior.Play = option.play;
//        }
//        let newMe = new MovieBindingBehaviorBuilder<any>(me.Owner);
//        newMe.CurrentElement = me.CurrentElement;
//        newMe.CurrentBehavior = me.CurrentBehavior;
//        return newMe;
//    }

//}