using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace GrandMonsieur
{
    [HubName("Download")]
    public class Download : Hub
    {
        [HubMethodName("RequestDownload")]
        public async Task<dynamic> RequestDownload(string uri)
        {
            var caller = Clients.Caller;
            var root = HttpContext.Current.Server.MapPath("/");
            using (var downloader = new Core.Downloader(
                System.IO.Path.Combine(root, "youtube-dl.exe")))
            {
                downloader.ErrorLogging += async (sender, e) =>
                {
                    await caller.Error(new { Uri = uri, e.Message });
                };
                downloader.Downloding += async (sender, e) =>
                {
                    await caller.Downloading(new { Uri = uri, e.Message });
                };

                var fileName = downloader.GetFileName(uri);

                await caller.Starting(new { Uri = uri, FileName = fileName });

                var dir = "App_Data";
                var u = new Uri(uri);
                var domain = GetSafeDirectoryName(u.Authority);
                var name = GetSafeDirectoryName(u.Segments.LastOrDefault());
                var extension = Path.GetExtension(fileName);
                var saveDirectory = Path.Combine(root, dir, domain, name);
                if (!Directory.Exists(saveDirectory))
                {
                    Directory.CreateDirectory(saveDirectory);
                }

                var saveFileName = $"{Guid.NewGuid()}{extension}";
                var vp = $"{Site()}{dir}/{domain}/{name}/{saveFileName}";

                var fullPath = Path.Combine(saveDirectory, saveFileName);

                if (!File.Exists(fullPath))
                {
                    await downloader.Do(uri, fullPath);
                }

                return new { Uri = uri, Path = vp, Name = fileName };
            }
        }

        protected string Site()
        {
            var request = HttpContext.Current.Request;
            var path = HttpRuntime.AppDomainAppVirtualPath;
            return string.Format("{0}://{1}{2}", request.Url.Scheme, request.Url.Authority, path);
        }

        protected string GetSafeFileName(string s)
        {
            return GetSafeName(s, System.IO.Path.GetInvalidFileNameChars());
        }
        protected string GetSafeDirectoryName(string s)
        {
            return GetSafeName(s, System.IO.Path.GetInvalidPathChars());
        }
        protected string GetSafeName(string s, char[] invalitChars)
        {
            string illegal = "\"M\"\\a/ry/ h**ad:>> a\\/:*?\"| li*tt|le|| la\"mb.?";
            string invalid = new string(Path.GetInvalidFileNameChars()) + new string(Path.GetInvalidPathChars());

            foreach (char c in invalid)
            {
                illegal = illegal.Replace(c.ToString(), "");
            }
            return illegal;
        }
    }
}