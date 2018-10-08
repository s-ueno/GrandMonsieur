using System;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;


[assembly: OwinStartup(typeof(GrandMonsieur.Startup))]
namespace GrandMonsieur
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // app.MapSignalR<PushConnectionAdapter>("/Download");



            GlobalHost.DependencyResolver.Register(typeof(Download), () => new Download());
            app.MapSignalR("/DownloadHub", new HubConfiguration()
            {

            });

        }
    }
}
