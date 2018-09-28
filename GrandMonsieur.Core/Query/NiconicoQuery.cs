using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace GrandMonsieur.Core
{
    public class NiconicoQuery : Query
    {
        public NiconicoQuery()
        {
            VideoType = VideoType.Niconico;
            Order = OrderMode.ViewCount;
            Service = Target.video;
        }
        public static readonly string SearchUri = Utils.AppSettings<string>("SearchUri.niconico", "https://api.search.nicovideo.jp/api/v2/{0}/contents/search?");
        public static readonly string IFrameUri = Utils.AppSettings<string>("IFrameURi.niconico", "https://embed.nicovideo.jp/watch/{0}");

        protected Target Service { get; set; }

        public enum Target
        {
            video, live
        }

        public override string Generate()
        {
            var list = new List<string>();
            list.Add("targets=title,description,tags&fields=contentId,title,viewCounter,startTime,lengthSeconds,thumbnailUrl");
            list.Add(string.Format("q={0}", HttpUtility.UrlEncode(string.IsNullOrWhiteSpace(base.Filter) ? "" : base.Filter)));
            string arg = "viewCounter";
            switch (Order)
            {
                case OrderMode.Date:
                    arg = "startTime";
                    break;
                case OrderMode.Rating:
                    arg = "mylistCounter";
                    break;
                case OrderMode.ViewCount:
                    arg = "viewCounter";
                    break;
            }
            list.Add(string.Format("_sort={0}", arg));


            if (OldFilter == Filter)
            {
                int num = 1;
                int.TryParse(System.Convert.ToString(this.PageToken), out num);
                this.PageToken = num + 1;
            }
            else
            {
                this.PageToken = 1;
            }
            list.Add(string.Format("_offset={0}", this.PageToken));
            base.OldFilter = base.Filter;
            list.Add(string.Format("_limit={0}", base.MaxResults));

            list.Add("_context=GrandMonsieur");

            var uri = NiconicoQuery.SearchUri;
            if (this.Service == Target.live)
            {
                uri = string.Format(uri, "live");
            }
            else
            {
                uri = string.Format(uri, "video");
            }

            return uri + string.Join("&", list);
        }

        public override Response Parse(dynamic json)
        {
            var response = new Response();

            var meta = json.meta;
            response.TotalResults = meta.totalCount;
            response.PageToken = Convert.ToString(meta.id);

            var list = new List<ResponseDetail>();
            var items = json.data;
            if (items != null)
            {
                foreach (var each in items)
                {
                    var detail = new ResponseDetail();
                    int sec = int.Parse(Convert.ToString(each.lengthSeconds));
                    detail.Duration = ToDuration(sec);
                    detail.Id = each.contentId;
                    detail.Uri = string.Format(IFrameUri, each.contentId);
                    detail.EmbededUri = string.Format(IFrameUri, each.contentId);

                    // detail.CreateUser = each["owner.screenname"];
                    detail.ThumbnailUri = each.thumbnailUrl;
                    detail.Title = each.title;
                    detail.ViewCount = $"{each.viewCounter} views"; ;
                    list.Add(detail);
                }
            }
            response.Items = list;
            return response;
        }

        protected string ToDuration(int secs)
        {
            var t = TimeSpan.FromSeconds(secs);
            return string.Format("{0:D2}h:{1:D2}m:{2:D2}s", t.Hours, t.Minutes, t.Seconds);
        }
    }
}
