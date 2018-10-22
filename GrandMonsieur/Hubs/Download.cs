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
        public async Task<dynamic> RequestDownload(string uri, string title, bool soundOnly)
        {
            var downloadUri = uri;
            var caller = Clients.Caller;
            var root = HttpContext.Current.Server.MapPath("/");
            //if (title.EndsWith("..."))
            //{
            //    title = new string(title.Take(title.Length - 3).ToArray());
            //}
            Trace.TraceInformation($"★★★★title:{title}");


            using (var downloader = new Core.Downloader(root))
            {
                downloader.ErrorLogging += async (sender, e) =>
                {
                    await caller.Error(new { Uri = uri, e.Message });
                };
                downloader.Downloding += async (sender, e) =>
                {
                    await caller.Downloading(new { Uri = uri, e.Message });
                };


                // ニコニコ調整
                if (uri.StartsWith("https://embed.nicovideo.jp"))
                {
                    downloadUri = uri.Replace("https://embed.nicovideo.jp", "https://www.nicovideo.jp");
                }

                var fileName = await downloader.GetFileNameAsync(downloadUri, soundOnly);
                var ext = Path.GetExtension(fileName);
                fileName = $"{GetSafeName(title)}{ext}";
                Trace.TraceInformation($"★★★★fileName:{fileName}");

                await caller.Starting(new { Uri = uri, Message = fileName });


                var targetUri = new Uri(downloadUri);
                var dir = "App_Data";
                var localPath = targetUri.LocalPath;
                var saveDirectory = Path.Combine(root, dir);

                // youtube調整
                var isYoutube = uri.StartsWith("https://www.youtube.com");
                if (isYoutube)
                {
                    localPath = $"{localPath}/{GetSafeName(targetUri.Query)}";
                }

                foreach (var each in localPath.Split('/'))
                {
                    saveDirectory = Path.Combine(saveDirectory, each);
                }

                if (!Directory.Exists(saveDirectory))
                {
                    Directory.CreateDirectory(saveDirectory);
                }

                var trashFiles = Directory.GetFiles(saveDirectory, "*.part");
                foreach (var each in trashFiles)
                {
                    try
                    {
                        File.Delete(each);
                    }
                    catch (Exception ex)
                    {
                        Trace.TraceError(ex.ToString());
                    }
                }

                var saveFileName = GetSafeName(fileName);
                var vp = $"{Site()}{dir}/{localPath}/{saveFileName}";
                var fullPath = Path.Combine(saveDirectory, saveFileName);

                if (!File.Exists(fullPath))
                {
                    await downloader.Do(downloadUri, fullPath, soundOnly);
                }

                return new { Uri = uri, Path = vp, Message = fileName };
            }
        }

        protected string Site()
        {
            var request = HttpContext.Current.Request;
            var path = HttpRuntime.AppDomainAppVirtualPath;
            return string.Format("{0}://{1}{2}", request.Url.Scheme, request.Url.Authority, path);
        }
        protected string GetSafeName(string s)
        {
            s = s.Replace("#", "＃");
            string invalid = new string(Path.GetInvalidFileNameChars()) + new string(Path.GetInvalidPathChars());// + " " + "　";
            foreach (char c in invalid)
            {
                s = s.Replace(c.ToString(), "");
            }
            return s;
        }
    }
}