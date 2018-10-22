using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GrandMonsieur.Core
{
    public class QueryHelper
    {

        public Response FindQuery(Query query)
        {
            var requestUri = query.BuildUri();
            var result = query.GetDynamicData(requestUri);
            return query.ParseDynamicData(result);
        }

    }
}
