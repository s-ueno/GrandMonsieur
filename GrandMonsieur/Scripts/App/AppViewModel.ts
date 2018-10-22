namespace GrandMonsieur {

    export abstract class AppViewModel extends DomBehind.BizViewModel {


        public GetTable<T>(ctor: DomBehind.TypedConstructor<T>): DomBehind.IndexedDBHelper<T> {
            return new DomBehind.IndexedDBHelper(ctor, "Monsieur");
        }

        public AddDownloadList(e: MovieInfo) {
            this.UpdateMovieInfo(e);

            let table = this.GetTable(DownloadInfo);
            table.FindRowAsync(x => x.Uri, e.Uri).done(x => {
                if (x && x.DownloadedDate) {
                    toastr.info(`${e.Title} はダウンロード済みです。リストから確認してください。`);
                } else {
                    table.UpsertAsync(new DownloadInfo(e), x => x.Uri).always(() => {
                        toastr.info(`${e.Title} をダウンロードリストに追加しました。`);
                    });
                }
            }).fail(() => {
                table.UpsertAsync(new DownloadInfo(e), x => x.Uri).always(() => {
                    toastr.info(`${e.Title} をダウンロードリストに追加しました。`);
                });
            });
        }

        public PlayRaw(e: MovieInfo) {
            $.SetDomStorage("Player_Uri", e.Source.EmbededUri);
            this.Navigator.ShowModal(`home/player`, {
                ShowHeader: false,
            })

            this.UpdateMovieInfo(e);
        }


        private UpdateMovieInfo(e: MovieInfo) {
            let cleanInfo = new MovieInfo();
            cleanInfo.Thumbnail = e.Thumbnail;
            cleanInfo.Duration = e.Duration;
            cleanInfo.Title = e.Title;
            cleanInfo.Owner = e.Owner;
            cleanInfo.Views = e.Views;
            cleanInfo.Uri = e.Uri;
            cleanInfo.Source = e.Source;
            cleanInfo.UpdateDate = e.UpdateDate;
            cleanInfo.MovieStatus = e.MovieStatus;
            let table = this.GetTable(MovieInfo);
            table.FindRowAsync(x => x.Uri, e.Uri).always(() => {
                table.UpsertAsync(cleanInfo, y => y.Uri).fail(err => console.error(err));
            });
        }
    }
}