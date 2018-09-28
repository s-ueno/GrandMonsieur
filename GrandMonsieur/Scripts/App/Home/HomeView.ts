namespace GrandMonsieur.Home {
    import UIElement = DomBehind.UIElement;
    export class HomeView extends DomBehind.BizView {

        BuildBinding(): void {
            let builder = this.CreateBindingBuilder<HomeViewModel>();

            let youtubeBinding =
                builder.Element(".youtube_container")
                    .BindingMovies<MovieInfo>(x => x.YoutubeList, {
                        download: (x, e) => x.Download(e),
                        play: (x, e) => x.Play(e)
                    });
            youtubeBinding
                .BindingThumbnail(x => x.Thumbnail)
                .BindingDuration(x => x.Duration)
                .BindingTitle(x => x.Title)
                .BindingOwner(x => x.Owner)
                .BindingViews(x => x.Views)
                .BindingUpdateDate(x => x.UpdateDate);



            let dailyBinding =
                builder.Element(".dailymotion_container")
                    .BindingMovies<MovieInfo>(x => x.DailymotionList, {
                        download: (x, e) => x.Download(e),
                        play: (x, e) => x.Play(e)
                    });
            dailyBinding
                .BindingThumbnail(x => x.Thumbnail)
                .BindingDuration(x => x.Duration)
                .BindingTitle(x => x.Title)
                .BindingOwner(x => x.Owner)
                .BindingViews(x => x.Views)
                .BindingUpdateDate(x => x.UpdateDate);


            let niconicoBinding =
                builder.Element(".niconico_container")
                    .BindingMovies<MovieInfo>(x => x.NiconicoList, {
                        download: (x, e) => x.Download(e),
                        play: (x, e) => x.Play(e)
                    });
            niconicoBinding
                .BindingThumbnail(x => x.Thumbnail)
                .BindingDuration(x => x.Duration)
                .BindingTitle(x => x.Title)
                .BindingOwner(x => x.Owner)
                .BindingViews(x => x.Views)
                .BindingUpdateDate(x => x.UpdateDate);
        }

    }
}