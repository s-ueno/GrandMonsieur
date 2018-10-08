using NYoutubeDL;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static NYoutubeDL.Helpers.Enums;

namespace GrandMonsieur.Core
{
    public class DownloaderMessageEventArgs : EventArgs
    {
        public DownloaderMessageEventArgs(string message)
        {
            this.Message = message;
        }
        public string Message { get; private set; }
    }



    public class Downloader : IDisposable
    {


        protected string UtilityPath;
        public Downloader(string utilityPath)
        {
            this.UtilityPath = utilityPath;
        }

        public event EventHandler<DownloaderMessageEventArgs> ErrorLogging;
        public event EventHandler<DownloaderMessageEventArgs> Downloding;

        public async Task Do(string uri, string savePath)
        {
            var ydlClient = new YoutubeDL();
            ydlClient.YoutubeDlPath = this.UtilityPath;

            ydlClient.Options.DownloadOptions.FragmentRetries = -1;
            ydlClient.Options.DownloadOptions.Retries = -1;
            ydlClient.Options.VideoFormatOptions.Format = VideoFormat.best;
            ydlClient.Options.PostProcessingOptions.AudioFormat = AudioFormat.best;
            ydlClient.Options.PostProcessingOptions.AudioQuality = "0";
            ydlClient.Options.PostProcessingOptions.ExtractAudio = true;
            ydlClient.Options.GeneralOptions.Update = true;
            ydlClient.Options.FilesystemOptions.Output = savePath;

            ydlClient.StandardErrorEvent += (sender, e) =>
            {
                OnErrorLogging(e);
            };
            ydlClient.StandardOutputEvent += (sender, s) =>
            {
                OnDownloading(s);
            };
            await ydlClient.DownloadAsync(uri);
        }

        protected void OnDownloading(String message)
        {
            Downloding?.Invoke(this, new DownloaderMessageEventArgs(message));
        }
        protected void OnErrorLogging(String message)
        {
            ErrorLogging?.Invoke(this, new DownloaderMessageEventArgs(message));
        }

        public string GetFileName(string uri)
        {
            return GetInfo("--get-filename ", uri).FirstOrDefault();
        }

        public  string GetExtension(string uri)
        {
            var allInfo = GetInfo("--list-format", uri).ToArray();
            var best = allInfo.FirstOrDefault(x => x.Contains("(best)")) ?? allInfo.FirstOrDefault();
            if (string.IsNullOrWhiteSpace(best)) return null;

            var ext = new string( best.Skip(13).Take(3).ToArray()).Trim();
            return ext;
        }



        public IEnumerable<string> GetInfo(string command, string uri)
        {
            var p = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = this.UtilityPath,
                    Arguments = $"{command} {uri}",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                }
            };
            p.Start();
            while (!p.StandardOutput.EndOfStream)
            {
                string line = p.StandardOutput.ReadLine();
                yield return line;
            }
        }

        public void Dispose()
        {
            if (this.Downloding != null)
                this.Downloding = null;

            if (this.ErrorLogging != null)
                this.ErrorLogging = null;
        }
    }
}
