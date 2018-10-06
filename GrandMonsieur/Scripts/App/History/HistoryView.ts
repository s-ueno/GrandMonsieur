namespace GrandMonsieur.History {
    import UIElement = DomBehind.UIElement;
    export class HistoryView extends AppView {

        BuildBinding(): void {
            let builder = this.CreateBindingBuilder<HistoryViewModel>();

            let rowContext =
                builder.Element(".history_container")
                    .BuildTemplateItems<MovieInfo>(x => x.History, {
                        template: "#historyTemplate",
                    });
            rowContext
                .BindingProperty(UIElement.SrcProperty, ".movie_thumbnail", x => x.Thumbnail)
                .BindingProperty(UIElement.TextProperty, ".movie_duration", x => x.Duration)
                .BindingProperty(UIElement.TextProperty, ".movie_title", x => x.Title)
                .BindingProperty(UIElement.TextProperty, ".movie_owner", x => x.Owner)
                .BindingProperty(UIElement.TextProperty, ".movie_views", x => x.Views, { convertTarget: x => this.Views(x) })
                .BindingProperty(UIElement.TextProperty, ".movie_publish", x => x.UpdateDate, { convertTarget: x => this.DateDiff(x) })
                .BindingColumnAction(".movie_play", (x, args) => x.Play(args))
                .BindingColumnAction(".movie_download", (x, args) => x.Download(args));


            builder.Element(".delete-history")
                .BindingAction(UIElement.Click, x => x.ClearHistory());
        }

    }
}