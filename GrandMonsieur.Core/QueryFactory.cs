using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GrandMonsieur.Core
{
    public class QueryFactory
    {
        public static IEnumerable<Query> Queries()
        {
            var list = new List<Query>();
            list.Add(new YoutubeQuery());
            list.Add(new DailymotionQuery());
            list.Add(new NiconicoQuery());
            return list;
        }

    }
}
