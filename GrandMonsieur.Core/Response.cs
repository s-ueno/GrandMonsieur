using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GrandMonsieur.Core
{
    [Serializable]
    public class Response
    {
        public double TotalResults
        {
            get;
            set;
        }


        public string PageToken
        {
            get;
            set;
        }

        public System.Collections.Generic.IEnumerable<ResponseDetail> Items
        {
            get;
            internal set;
        }
    }

    [Serializable]
    public class ResponseDetail
    {
        public string Id
        {
            get;
            set;
        }

        public string Title
        {
            get;
            set;
        }

        public string Uri
        {
            get;
            set;
        }

        public string EmbededUri
        {
            get;
            set;
        }

        public string ThumbnailUri
        {
            get;
            set;
        }

        public string Duration
        {
            get;
            set;
        }

        public string CreateUser
        {
            get;
            set;
        }

        public string ViewCount
        {
            get;
            set;
        }
        public string PublishedAt
        {
            get;
            set;
        }
    }
}
