using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GrandMonsieur.Controllers
{
    [AllowAnonymous]
    public class HistoryController : AppController
    {
        // GET: History
        public ActionResult Index()
        {
            return View();
        }
    }
}