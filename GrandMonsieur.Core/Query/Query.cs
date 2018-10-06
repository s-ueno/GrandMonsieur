using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GrandMonsieur.Core
{
    public abstract class Query
    {
        public string Filter
        {
            get;
            set;
        }

        public int MaxResults
        {
            get;
            set;
        }

        public OrderMode Order
        {
            get;
            set;
        }

        public Definition VideoDefinition
        {
            get;
            set;
        }

        public Duration VideoDuration
        {
            get;
            set;
        }

        public VideoType VideoType
        {
            get;
            internal set;
        }

        protected string OldFilter
        {
            get;
            set;
        }

        public virtual object PageToken
        {
            get;
            set;
        }

        public Query()
        {
            this.VideoDuration = Duration.Any;
            this.VideoDefinition = Definition.Any;
            this.Order = OrderMode.Relevance;
            this.MaxResults = 40;
        }

        public abstract string Generate();

        public abstract Response Parse(dynamic json);
    }
}
