namespace GrandMonsieur {
    export enum MovieStatus {
        None,
        Watched,
        DownloadQueue,
        Downloaded
    }
    export class MovieInfo {
        Thumbnail: string;
        Duration: string;
        Title: string;
        Owner: string;
        Views: string;
        Uri: any;
        Source: any;
        UpdateDate: string;

        LastUpdateDate?: Date;
        MovieStatus?: MovieStatus = MovieStatus.None;
    }

    export enum DownloadStatus {
        None, Doing, Done
    }
    export class DownloadInfo extends MovieInfo {
        constructor(src?: MovieInfo) {
            super();
            if (src) {
                this.Thumbnail = src.Thumbnail;
                this.Duration = src.Duration;
                this.Title = src.Title;
                this.Owner = src.Owner;
                this.Views = src.Views;
                this.Uri = src.Uri;
                this.Source = src.Source;
                this.UpdateDate = src.UpdateDate;
                this.AddDownloadListDate = new Date();
                this.MovieStatus = src.MovieStatus;
                this.LastUpdateDate = src.LastUpdateDate;
                this.Status = DownloadStatus.None;
                this.NotifyInfomation = "";
                this.DownloadUri = "";
                this.DownloadUriAlias = "";
            }
        }
        public AddDownloadListDate?: Date;
        public DownloadedDate?: Date;
        public Status?: DownloadStatus;
        public NotifyInfomation?: string;
        public DownloadUri?: string;
        public DownloadUriAlias?: string;

        public static Clone(me: DownloadInfo): DownloadInfo {
            let newMe = new DownloadInfo();
            newMe.Thumbnail = me.Thumbnail;
            newMe.Duration = me.Duration;
            newMe.Title = me.Title;
            newMe.Owner = me.Owner;
            newMe.Views = me.Views;
            newMe.Uri = me.Uri;
            newMe.Source = me.Source;
            newMe.UpdateDate = me.UpdateDate;
            newMe.AddDownloadListDate = me.AddDownloadListDate;
            newMe.MovieStatus = me.MovieStatus;
            newMe.LastUpdateDate = me.LastUpdateDate;
            newMe.Status = me.Status;
            newMe.NotifyInfomation = me.NotifyInfomation;
            newMe.DownloadUri = me.DownloadUri;
            newMe.DownloadUriAlias = me.DownloadUriAlias;
            return newMe;
        }

    }
}