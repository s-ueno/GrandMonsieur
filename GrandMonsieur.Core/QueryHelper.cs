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
            var requestUri = query.Generate();
            var result = Utils.JsonRead(requestUri);
            return query.Parse(result);
        }

    }
}
