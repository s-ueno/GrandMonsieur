using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace GrandMonsieur.Core
{
    public class DailymotionQuery : Query
    {
        public DailymotionQuery()
        {
            this.VideoType = VideoType.Dailymotion;
        }
        public static readonly string SearchUri = Utils.AppSettings<string>("SearchUri.Dailymotion", "https://api.dailymotion.com/videos?");
        public static readonly string IFrameUri = Utils.AppSettings<string>("IFrameURi.Dailymotion", "https://www.dailymotion.com/embed/video/{0}");
        public override string BuildUri()
        {
            var list = new List<string>();
            list.Add("fields=duration_formatted,id,owner.screenname,thumbnail_url,title,url,embed_url,views_total");
            list.Add(string.Format("search={0}", HttpUtility.UrlEncode(string.IsNullOrWhiteSpace(base.Filter) ? "news" : base.Filter)));
            string arg = "relevance";
            switch (base.Order)
            {
                case OrderMode.Date:
                    arg = "recent";
                    break;
                case OrderMode.Rating:
                    arg = "rated";
                    break;
                case OrderMode.Relevance:
                    arg = "relevance";
                    break;
                case OrderMode.ViewCount:
                    arg = "visited";
                    break;
            }
            list.Add(string.Format("sort={0}", arg));
            if (this.PageToken != null)
            {
                int num = 1;
                int.TryParse(System.Convert.ToString(this.PageToken), out num);
                this.PageToken = num + 1;
            }
            else
            {
                this.PageToken = 1;
            }
            list.Add(string.Format("page={0}", this.PageToken));
            base.OldFilter = base.Filter;
            list.Add(string.Format("limit={0}", base.MaxResults));
            return DailymotionQuery.SearchUri + string.Join("&", list);
        }

        public override Response ParseDynamicData(dynamic json)
        {
            var response = new Response();

            response.TotalResults = json.total;
            response.PageToken = Convert.ToString(json.page);

            var list = new List<ResponseDetail>();
            var items = json.list;
            if (items != null)
            {
                foreach (var each in items)
                {
                    var detail = new ResponseDetail();
                    detail.Duration = each.duration_formatted;
                    detail.Id = each.id;
                    detail.Uri = each.url;
                    detail.EmbededUri = string.Format(IFrameUri, detail.Id);
                    detail.CreateUser = each["owner.screenname"];
                    detail.ThumbnailUri = each.thumbnail_url;
                    detail.Title = each.title;
                    detail.ViewCount = $"{each.views_total}";
                    list.Add(detail);
                }
            }
            response.Items = list;
            return response;
        }
    }
}
