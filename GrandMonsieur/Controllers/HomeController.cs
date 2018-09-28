using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using GrandMonsieur.Core;
namespace GrandMonsieur.Controllers
{
    public class InitializeRequest
    {
        public int VideoType { get; set; }
    }

    public class InitializeResponse
    {
        public Response Response { get; set; }
    }

    public class SearchRequest
    {
        public int VideoType { get; set; }
        public string Filter { get; set; }
    }
    public class SearchResponse
    {
        public Response Response { get; set; }
    }


    [AllowAnonymous]
    public class HomeController : AppController
    {
        private volatile static string _rootUri;

        public ActionResult Index()
        {
            if (string.IsNullOrWhiteSpace(_rootUri))
            {
                bool isSecureConnection = String.Equals(Request.ServerVariables["HTTP_X_FORWARDED_PROTO"], "https", StringComparison.OrdinalIgnoreCase);
                if (isSecureConnection)
                {
                    _rootUri = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, Url.Content("~"));
                }
                else
                {
                    _rootUri = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, Url.Content("~"));
                }
            }
            ViewBag.RootUri = _rootUri;
            return View();
        }
        public ActionResult Player()
        {
            return View();
        }



        public ActionResult Initialize(InitializeRequest request)
        {
            try
            {
                return ToJson(InitializeRaw((VideoType)request.VideoType));
            }
            catch (Exception ex)
            {
                return ToError(ex);
            }
        }

        protected InitializeResponse InitializeRaw(VideoType type)
        {
            var result = new InitializeResponse();
            var query = QueryFactory.Queries().FirstOrDefault(x => x.VideoType == type);
            query.MaxResults = 15;
            // hack
            //query.Order = OrderMode.Date;

            var helper = new QueryHelper();
            result.Response = helper.FindQuery(query);

            return result;
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
            query.MaxResults = 15;
            // hack
            //query.Order = OrderMode.Date;
            query.Filter = request.Filter;

            var helper = new QueryHelper();
            response.Response = helper.FindQuery(query);
            return response;
        }

    }
}
