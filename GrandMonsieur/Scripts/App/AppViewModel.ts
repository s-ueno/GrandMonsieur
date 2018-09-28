namespace GrandMonsieur {

    export abstract class AppViewModel extends DomBehind.BizViewModel {


        public GetTable<T>(ctor: DomBehind.TypedConstructor<T>): DomBehind.IndexedDBHelper<T> {
            return new DomBehind.IndexedDBHelper(ctor, "Monsieur");
        }

        public DownloadRaw(e: MovieInfo) {
            let table = this.GetTable(DownloadInfo);
            table.UpsertAsync(new DownloadInfo(e), x => x.Uri).always(() => {
                this.Navigator.Move("Download");
            });
        }

        public PlayRaw(e: MovieInfo) {
            $.SetDomStorage("Player_Uri", e.Source.EmbededUri);
            this.Navigator.ShowModal(`home/player`, {
                ShowHeader: false,
            })


            let cleanInfo = new MovieInfo();
            cleanInfo.Thumbnail = e.Thumbnail;
            cleanInfo.Duration = e.Duration;
            cleanInfo.Title = e.Title;
            cleanInfo.Owner = e.Owner;
            cleanInfo.Views = e.Views;
            cleanInfo.Uri = e.Uri;
            cleanInfo.Source = e.Source;
            cleanInfo.UpdateDate = e.UpdateDate;
            cleanInfo.LastPlayDate = new Date();
            let table = this.GetTable(MovieInfo);
            table.FindRowAsync(x => x.Uri, e.Uri).always(() => {
                table.UpsertAsync(cleanInfo, y => y.Uri).fail(err => console.error(err));
            });
        }

    }
}