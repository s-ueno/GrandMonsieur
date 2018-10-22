namespace GrandMonsieur.Download {
    import UIElement = DomBehind.UIElement;
    export class DownloadView extends AppView {
        BuildBinding(): void {
            let builder = this.CreateBindingBuilder<DownloadViewModel>();

            let rowContext =
                builder.Element(".history_container")
                    .BuildTemplateItems<DownloadInfo>(x => x.History, {
                        template: "#downloadTemplate",
                    });
            rowContext
                .BindingProperty(UIElement.SrcProperty, ".movie_thumbnail", x => x.Thumbnail)
                .BindingProperty(UIElement.TextProperty, ".movie_duration", x => x.Duration)
                .BindingProperty(UIElement.TextProperty, ".movie_title", x => x.Title)
                .BindingProperty(UIElement.TextProperty, ".movie_owner", x => x.Owner)
                .BindingProperty(UIElement.TextProperty, ".movie_views", x => x.Views, { convertTarget: x => this.Views(x) })
                .BindingProperty(UIElement.TextProperty, ".movie_publish", x => x.UpdateDate, { convertTarget: x => this.DateDiff(x) })
                .BindingProperty(UIElement.IsVisibleProperty, ".movie_watched", x => x.MovieStatus, {
                    mode: DomBehind.Data.BindingMode.TwoWay,
                    convertTarget: x => {
                        if (!x) return false;
                        return x === MovieStatus.Downloaded;
                    }
                })
                .BindingProperty(UIElement.OpacityProperty, ".movie_downloadRequest", x => x.Status, {
                    convertTarget: (x: DownloadStatus) => x === DownloadStatus.None ? 1 : 0,
                    mode: DomBehind.Data.BindingMode.TwoWay,
                })
                .BindingProperty(UIElement.IsVisibleProperty, ".movie_progress", x => x.Status, {
                    convertTarget: (x: DownloadStatus, element: JQuery) => {
                        let result = x === DownloadStatus.Doing ? 1 : 0;
                        if (result) {
                            setTimeout(() => {
                                element.progressbar({ value: false });
                            }, 100);
                        }
                        return result;
                    },
                    mode: DomBehind.Data.BindingMode.TwoWay,
                })
                .BindingColumnAction(".movie_videoDownloadRequest", (x, args) => x.Download(args, false))
                .BindingColumnAction(".movie_soundDownloadRequest", (x, args) => x.Download(args, true))

                .BindingProperty(UIElement.TextProperty, ".movie_infomation", x => x.NotifyInfomation, {
                    mode: DomBehind.Data.BindingMode.TwoWay
                })
                .BindingProperty(UIElement.HrefProperty, ".movie_downloadLink", x => x.DownloadUri, {
                    mode: DomBehind.Data.BindingMode.TwoWay
                })
                .BindingProperty(UIElement.TextProperty, ".movie_downloadLink", x => x.DownloadUriAlias, {
                    mode: DomBehind.Data.BindingMode.TwoWay
                })

                .BindingColumnAction(".movie_play", (x, args) => x.Play(args))
                ;

            builder.Element(".delete-history")
                .BindingAction(UIElement.Click, x => x.ClearHistory());



        }
    }
}