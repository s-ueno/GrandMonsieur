using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace GrandMonsieur.Core
{
    [System.Flags]
    public enum YoutubeVideoType
    {
        channel = 2,
        playlist = 4,
        video = 8
    }
    public class YoutubeQuery : Query
    {
        public static readonly string ApiKey = Utils.AppSettings<string>("ApiKey.Youtube", "{your key}");
        public static readonly string SearchUri = Utils.AppSettings<string>("SearchUri.Youtube", "https://www.googleapis.com/youtube/v3/search?");
        public static readonly string SearchDetaillUri = Utils.AppSettings<string>("SearchDetaillUri.Youtube", "https://www.googleapis.com/youtube/v3/videos?id={0}&key={1}&fields=items(id,contentDetails/duration,statistics/viewCount,snippet/channelTitle)&part=contentDetails,statistics,snippet");
        public static readonly string EmbedUrl = Utils.AppSettings<string>("EmbedUrl.Youtube", "https://www.youtube.com/v/{0}?version=3&rel=0");
        public static readonly string IFrameUri = Utils.AppSettings<string>("IFrameURi.Youtube", "https://www.youtube.com/embed/{0}");
        private static readonly string downloadUrl = Utils.AppSettings<string>("DownloadUrl.Youtube", "https://www.youtube.com/watch?v={0}");
        public YoutubeVideoType YoutubeVideoType { get; set; } = YoutubeVideoType.video;

        public YoutubeQuery()
        {
            this.VideoType = VideoType.Youtube;
            this.Order = OrderMode.Relevance;
        }

        public override string Generate()
        {
            var list = new List<string>();
            list.Add(string.Format("part={0}", "snippet"));
            list.Add(string.Format("maxResults={0}", base.MaxResults));
            list.Add(string.Format("order={0}", base.Order.ToString().ToLower()));
            list.Add(string.Format("type={0}", this.YoutubeVideoType.ToQueryString()));
            if (base.OldFilter == base.Filter && !string.IsNullOrWhiteSpace(Convert.ToString(this.PageToken)))
            {
                list.Add(string.Format("pageToken={0}", this.PageToken));
            }
            base.OldFilter = base.Filter;
            list.Add(string.Format("key={0}", YoutubeQuery.ApiKey));
            list.Add(string.Format("q={0}", HttpUtility.UrlEncode(base.Filter ?? string.Empty)));
            return YoutubeQuery.SearchUri + string.Join("&", list);
        }

        public override Response Parse(dynamic json)
        {
            var response = new Response();

            var pageInfo = json.pageInfo;
            if (pageInfo != null)
            {
                response.TotalResults = pageInfo.totalResults;
            }

            try
            {
                response.PageToken = json.nextPageToken;
            }
            catch
            {
            }

            var list = new List<ResponseDetail>();
            try
            {
                var items = json.items;
                if (items != null)
                {
                    foreach (var each in items)
                    {
                        var detail = new ResponseDetail();
                        var id = each.id;
                        detail.Id = id.videoId;
                        detail.Uri = string.Format(downloadUrl, detail.Id);
                        detail.EmbededUri = string.Format(IFrameUri, detail.Id);
                        var snippet = each.snippet;
                        if (DateTime.TryParse(snippet.publishedAt, out DateTime dt))
                        {
                            var dts = dt.ToShortDateString();
                            detail.PublishedAt = dts;
                        }
                        detail.Title = snippet.title;

                        var thumbnails = snippet.thumbnails;
                        var medium = thumbnails.medium;
                        detail.ThumbnailUri = medium.url;


                        var detailUri = string.Format(SearchDetaillUri, detail.Id, ApiKey);
                        var dynamicDetail = Utils.JsonRead(detailUri);
                        var detailItem = dynamicDetail.items[0];
                        var detailItemSnippet = detailItem.snippet;
                        detail.CreateUser = detailItemSnippet.channelTitle;

                        var contentDetails = detailItem.contentDetails;
                        var duration = contentDetails.duration;
                        string text = (duration as string).Replace("PT", "").Replace("H", ":").Replace("M", ":").Replace("S", "");
                        string[] array = text.Split(new char[] { ':' });
                        if (array.Length == 1)
                        {
                            array = new string[] { "00", array[0] };
                        }
                        detail.Duration = string.Join(":", array.Select(x => x.PadLeft(2, '0')));

                        var statistics = detailItem.statistics;
                        detail.ViewCount = $"{statistics.viewCount} views";

                        list.Add(detail);

                    }
                }
                response.Items = list;
            }
            catch
            {
            }
            return response;
        }
    }
}
