using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Xml;

namespace GrandMonsieur.Core
{
    // 関連度
    // https://search.bilibili.com/all?keyword=baki&order=totalrank&duration=0&tids_1=0
    // 再生会数
    // https://search.bilibili.com/all?keyword=baki&order=click&duration=0&tids_1=0
    // 日付
    // https://search.bilibili.com/all?keyword=baki&order=pubdate&duration=0&tids_1=0
    // 弾幕
    // https://search.bilibili.com/all?keyword=baki&order=dm&duration=0&tids_1=0
    //お気に入り
    // https://search.bilibili.com/all?keyword=baki&order=stow&duration=0&tids_1=0


    public class BilibiliQuery : Query
    {
        public static readonly string SearchUri = Utils.AppSettings<string>("SearchUri.Bilibili", "https://api.bilibili.com/x/web-interface/search/all?");
        public static readonly string EmbedUrl = Utils.AppSettings<string>("EmbedUrl.Bilibili", "https://player.bilibili.com/player.html?aid={0}&page=1");

        public BilibiliQuery()
        {
            this.VideoType = VideoType.Bilibili;
            this.Order = OrderMode.Relevance;
        }

        public override string BuildUri()
        {
            var list = new List<string>();

            list.Add($"jsonp=\"jsonp\"");
            list.Add($"keyword={HttpUtility.UrlEncode(base.Filter ?? "news")}");

            string arg = "totalrank";
            switch (Order)
            {
                case OrderMode.Date:
                    arg = "pubdate";
                    break;
                case OrderMode.Rating:
                    arg = "stow";
                    break;
                case OrderMode.ViewCount:
                    arg = "click";
                    break;
            }
            list.Add($"order={arg}");

            if (PageToken != null)
            {
                int num = 1;
                int.TryParse(System.Convert.ToString(this.PageToken), out num);
                this.PageToken = num + 1;
            }
            else
            {
                this.PageToken = 1;
            }
            list.Add($"page={this.PageToken}");


            var uri = SearchUri;
            uri += string.Join("&", list);

            return uri;
        }

        public override Response ParseDynamicData(dynamic json)
        {
            var response = new Response();
           
            var data = json.data;
            var result = data.result;
            var videos = result.video;

            if (double.TryParse(Convert.ToString(data.numResults), out double value))
            {
                response.TotalResults = value;
            }
            response.PageToken = Convert.ToString(data.page);
            var list = new List<ResponseDetail>();
            try
            {
                foreach (var each in videos)
                {
                    var detail = new ResponseDetail();
                    detail.Id = Convert.ToString(each.id);
                    detail.Uri = each.arcurl;
                    detail.EmbededUri = string.Format(EmbedUrl, each.aid);

                    DateTime? pub = FromUnixTime(each.pubdate);
                    detail.PublishedAt = pub?.ToShortDateString();

                    detail.Title = Regex.Replace(each.title, "<[^>]*?>", "");
                    // detail.Title = Regex.Replace(each.title, "<[^>]*?>", ""); 
                    // detail.ThumbnailUri = $"https:{each.pic}";
                    detail.ThumbnailUri = $"{each.pic}";

                    detail.CreateUser = each.author;
                    detail.Duration = each.duration;
                    detail.ViewCount = Convert.ToString(each.play);

                    list.Add(detail);
                }
            }
            catch (Exception ex)
            {
                Trace.TraceError(ex.ToString());
            }
            response.Items = list;
            
            return response;
        }
        static DateTime? FromUnixTime(dynamic unixTime)
        {
            if (Int64.TryParse(Convert.ToString(unixTime), out Int64 value))
            {
                return DateTimeOffset.FromUnixTimeSeconds(value).LocalDateTime;
            }
            return null;
        }
    }
}
