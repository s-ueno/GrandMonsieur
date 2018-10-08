﻿namespace GrandMonsieur {
    export class MovieInfo {
        Thumbnail: string;
        Duration: string;
        Title: string;
        Owner: string;
        Views: string;
        Uri: any;
        Source: any;
        UpdateDate: string;
        IsWatched?: boolean;
        LastPlayDate?: Date;
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
                this.LastPlayDate = src.LastPlayDate;
                this.AddDownloadListDate = new Date();
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
    }
}