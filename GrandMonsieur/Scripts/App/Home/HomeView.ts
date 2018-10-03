namespace GrandMonsieur.Home {
    import UIElement = DomBehind.UIElement;
    import Selector = DomBehind.Controls.Selectmenu;
    export class HomeView extends AppView {

        BuildBinding(): void {
            let builder = this.CreateBindingBuilder<HomeViewModel>();

            builder.Element(".filter")
                .BindingAction(UIElement.Click, x => this.ToggleFilter());

            builder.Element(".Relevance")
                .BindingAction(UIElement.Click, x => this.Sort(x, "Relevance"));
            builder.Element(".Date")
                .BindingAction(UIElement.Click, x => this.Sort(x, "Date"));
            builder.Element(".ViewCount")
                .BindingAction(UIElement.Click, x => this.Sort(x, "ViewCount"));
            builder.Element(".Rating")
                .BindingAction(UIElement.Click, x => this.Sort(x, "Rating"));
            builder.Element(".Title")
                .BindingAction(UIElement.Click, x => this.Sort(x, "Title"));


            builder.Element(".Result10")
                .BindingAction(UIElement.Click, x => this.Result(x, ".Result10", 10));
            builder.Element(".Result15")
                .BindingAction(UIElement.Click, x => this.Result(x, ".Result15", 15));
            builder.Element(".Result30")
                .BindingAction(UIElement.Click, x => this.Result(x, ".Result30", 30));
            builder.Element(".Result50")
                .BindingAction(UIElement.Click, x => this.Result(x, ".Result50", 50));


            let youtubeBinding =
                builder.Element(".youtube_container")
                    .BuildTemplateItems<MovieInfo>(x => x.YoutubeList, {
                        template: "#movieTemplate",
                    });
            youtubeBinding
                .BindingProperty(UIElement.SrcProperty, ".movie_thumbnail", x => x.Thumbnail)
                .BindingProperty(UIElement.TextProperty, ".movie_duration", x => x.Duration)
                .BindingProperty(UIElement.TextProperty, ".movie_title", x => x.Title)
                .BindingProperty(UIElement.TextProperty, ".movie_owner", x => x.Owner)
                .BindingProperty(UIElement.TextProperty, ".movie_views", x => x.Views, { convertTarget: x => this.Views(x) })
                .BindingProperty(UIElement.TextProperty, ".movie_publish", x => x.UpdateDate, { convertTarget: x => this.DateDiff(x) })
                .BindingColumnAction(".movie_play", (x, args) => x.Play(args))
                .BindingColumnAction(".movie_download", (x, args) => x.Download(args));
            builder.Element(".youtube")
                .Binding(UIElement.IsVisibleProperty, x => x.AllowSearchYoutube);



            let dailyBinding =
                builder.Element(".dailymotion_container")
                    .BuildTemplateItems<MovieInfo>(x => x.DailymotionList, {
                        template: "#movieTemplate",
                    });
            dailyBinding
                .BindingProperty(UIElement.SrcProperty, ".movie_thumbnail", x => x.Thumbnail)
                .BindingProperty(UIElement.TextProperty, ".movie_duration", x => x.Duration)
                .BindingProperty(UIElement.TextProperty, ".movie_title", x => x.Title)
                .BindingProperty(UIElement.TextProperty, ".movie_owner", x => x.Owner)
                .BindingProperty(UIElement.TextProperty, ".movie_views", x => x.Views)
                .BindingProperty(UIElement.TextProperty, ".movie_publish", x => x.UpdateDate, { convertTarget: x => this.DateDiff(x) })
                .BindingColumnAction(".movie_play", (x, args) => x.Play(args))
                .BindingColumnAction(".movie_download", (x, args) => x.Download(args));
            builder.Element(".dailymotion")
                .Binding(UIElement.IsVisibleProperty, x => x.AllowSearchDaily);



            let niconicoBinding =
                builder.Element(".niconico_container")
                    .BuildTemplateItems<MovieInfo>(x => x.NiconicoList, {
                        template: "#movieTemplate",
                    });
            niconicoBinding
                .BindingProperty(UIElement.SrcProperty, ".movie_thumbnail", x => x.Thumbnail)
                .BindingProperty(UIElement.TextProperty, ".movie_duration", x => x.Duration)
                .BindingProperty(UIElement.TextProperty, ".movie_title", x => x.Title)
                .BindingProperty(UIElement.TextProperty, ".movie_owner", x => x.Owner)
                .BindingProperty(UIElement.TextProperty, ".movie_views", x => x.Views)
                .BindingProperty(UIElement.TextProperty, ".movie_publish", x => x.UpdateDate, { convertTarget: x => this.DateDiff(x) })
                .BindingColumnAction(".movie_play", (x, args) => x.Play(args))
                .BindingColumnAction(".movie_download", (x, args) => x.Download(args));
            builder.Element(".niconico")
                .Binding(UIElement.IsVisibleProperty, x => x.AllowSearchNiconico);



            builder.Element(".moreButton")
                .BindingAction(UIElement.Click, x => x.More());
        }



        public Sort(vm: HomeViewModel, cls: string) {
            this.Container.find(".sortContainer a").css("font-weight", "normal");
            let el = this.Container.find(`.${cls}`);
            if (el.length) {
                el.css("font-weight", "bold");
            }
            vm.Sort = cls;
            vm.Search();

            //this.ToggleFilter(1000, "easeOutSine");
        }
        public Result(vm: HomeViewModel, cls: string, length: number) {
            this.Container.find(".resultContainer a").css("font-weight", "normal");
            let el = this.Container.find(`${cls}`);
            if (el.length) {
                el.css("font-weight", "bold");
            }

            vm.Result = length;
            vm.Search();

            //this.ToggleFilter(1000, "easeOutSine");
        }

        protected ToggleFilter(duration: number = 0, easing?: string) {
            let element = this.Container.find(".filterContainer");
            element.toggleClass("hide");
        }

    }
}