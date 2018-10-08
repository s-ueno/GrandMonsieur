using System;
using System.Collections.Generic;
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
                var ex = downloader.GetExtension(uri);

                var fileName = downloader.GetFileName(uri);

                await caller.Starting(new { Uri = uri, FileName = fileName });

                downloader.Downloding += async (sender, e) =>
                {
                    await caller.Downloading(new { Uri = uri, e.Message });
                };
                downloader.ErrorLogging += async (sender, e) =>
                {
                    await caller.Error(new { Uri = uri, e.Message });
                };

                var dir = "App_Data";
                var u = new Uri(uri);
                var domain = GetSafeDirectoryName(u.Authority);
                var name = GetSafeDirectoryName(u.Segments.LastOrDefault());
                var saveFileName = GetSafeFileName(fileName);
                var saveDirectory = Path.Combine(root, dir, domain, name);
                if (!Directory.Exists(saveDirectory))
                {
                    Directory.CreateDirectory(saveDirectory);
                }


                var vp = $"{Site()}{dir}/{domain}/{name}/{saveFileName}";

                var fullPath = Path.Combine(saveDirectory, saveFileName);

                if (!File.Exists(fullPath))
                {
                    await downloader.Do(uri, fullPath);
                }

                return new { Uri = uri, Path = vp, Name = fileName };

                //var dir = "App_Data";
                //if (!Directory.Exists(dir))
                //{
                //    Directory.CreateDirectory(dir);
                //}

                //var vp = $"{Site()}/{domain}/{name}/{saveFileName}";
                //var saveFileName = $"{Guid.NewGuid().ToString()}";

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
            var charList = new List<char>();
            foreach (var each in s)
            {
                if (!invalitChars.Contains(each))
                {
                    charList.Add(each);
                }
            }
            return new string(charList.ToArray());
        }
    }
}