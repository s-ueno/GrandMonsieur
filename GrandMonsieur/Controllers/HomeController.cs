using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using GrandMonsieur.Core;
namespace GrandMonsieur.Controllers
{
    public class SearchRequest
    {
        public int VideoType { get; set; }
        public string Filter { get; set; }
        public string SortList { get; set; }
        public int SearchCount { get; set; }
    }
    public class SearchResponse
    {
        public Response Response { get; set; }
    }

    [AllowAnonymous]
    public class HomeController : AppController
    {
        public ActionResult Index()
        {
            var rootUri = string.Empty;
            bool isSecureConnection = String.Equals(Request.ServerVariables["HTTP_X_FORWARDED_PROTO"], "https", StringComparison.OrdinalIgnoreCase);
            if (isSecureConnection)
            {
                rootUri = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, Url.Content("~"));
            }
            else
            {
                rootUri = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, Url.Content("~"));
            }
            ViewBag.RootUri = rootUri;
            return View();
        }
        public ActionResult Player()
        {
            return View();
        }


        public ActionResult Search(SearchRequest request)
        {
            try
            {
                return ToJson(SearchRaw(request));
            }
            catch (Exception ex)
            {
                return ToError(ex);
            }
        }

        protected SearchResponse SearchRaw(SearchRequest request)
        {
            var response = new SearchResponse();
            var query = QueryFactory.Queries().FirstOrDefault(x => x.VideoType == (VideoType)request.VideoType);
            query.MaxResults = request.SearchCount;
            query.Filter = request.Filter;
            query.Order = ParseEnum<OrderMode>(request.SortList);
            var helper = new QueryHelper();
            response.Response = helper.FindQuery(query);
            return response;
        }
        static T ParseEnum<T>(string value)
        {
            return (T)Enum.Parse(typeof(T), value, true);
        }

    }
}
