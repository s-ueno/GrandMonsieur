namespace GrandMonsieur.Download {
    import UIElement = DomBehind.UIElement;
    export class DownloadView extends DomBehind.BizView {

        constructor() {
            super();


        }

        BuildBinding(): void {
            let builder = this.CreateBindingBuilder<DownloadViewModel>();

            let context =
                builder.Element(".history_container")
                    .BindingMovieHistory<MovieInfo>(x => x.History, {
                        download: (x, e) => x.Download(e),
                        play: (x, e) => x.Play(e),
                        downloadprogress: true,
                    });

            context
                .BindingThumbnail(x => x.Thumbnail)
                .BindingDuration(x => x.Duration)
                .BindingTitle(x => x.Title)
                .BindingOwner(x => x.Owner)
                .BindingViews(x => x.Views)
                .BindingUpdateDate(x => x.UpdateDate);


            builder.Element(".delete-history")
                .BindingAction(UIElement.Click, x => x.ClearHistory());
        }

    }
}