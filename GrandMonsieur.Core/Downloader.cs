using NYoutubeDL;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
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

        protected string PythonPath
        {
            get
            {
                var path = string.Empty;
                try
                {
                    path = ConfigurationManager.AppSettings["Downloader.PythonPath"];
                }
                catch (Exception)
                {
                }
                return path;
            }
        }
        protected int Timeout
        {
            get
            {
                var result = 1 * 1000 * 60 * 5;
                try
                {
                    var buff = ConfigurationManager.AppSettings["Downloader.Timeout"];
                    result = int.Parse(buff);
                }
                catch (Exception)
                {
                }
                return result;
            }
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

        public Task<string> GetFileName(string uri)
        {
            return GetInfo("--get-filename ", uri).FirstOrDefault();
        }

        public string GetExtension(string uri)
        {
            var allInfo = GetInfo("--list-format", uri).ToArray();
            var best = allInfo.FirstOrDefault(x => x.Contains("(best)")) ?? allInfo.FirstOrDefault();
            if (string.IsNullOrWhiteSpace(best)) return null;

            var ext = new string(best.Skip(13).Take(3).ToArray()).Trim();
            return ext;
        }

        protected async Task<IEnumerable<string>> GetInfo(string args, string uri)
        {

        }


        protected async Task<(IEnumerable<string> Log, IEnumerable<string> Error)> Execute(string fileName, string arguments,
            Action<string> outputReceived = null, Action<string> errorReceived = null)
        {
            var timeout = this.Timeout;
            using (Process process = new Process())
            {
                process.StartInfo.FileName = fileName;
                process.StartInfo.Arguments = arguments;
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;

                var output = new List<string>();
                var error = new List<string>();

                using (var outputWaitHandle = new AutoResetEvent(false))
                using (var errorWaitHandle = new AutoResetEvent(false))
                {
                    process.OutputDataReceived += (sender, e) =>
                    {
                        if (e.Data == null)
                        {
                            outputWaitHandle.Set();
                        }
                        else
                        {
                            outputReceived?.Invoke(e.Data);
                            output.Add(e.Data);
                        }
                    };
                    process.ErrorDataReceived += (sender, e) =>
                    {
                        if (e.Data == null)
                        {
                            errorWaitHandle.Set();
                        }
                        else
                        {
                            errorReceived?.Invoke(e.Data);
                            error.Add(e.Data);
                        }
                    };

                    process.Start();

                    process.BeginOutputReadLine();
                    process.BeginErrorReadLine();

                    await Task.Run(new Action(() =>
                    {
                        if (process.WaitForExit(timeout) &&
                            outputWaitHandle.WaitOne(timeout) &&
                            errorWaitHandle.WaitOne(timeout))
                        {
                        }
                        else
                        {
                            // Timed out.
                            throw new TimeoutException();
                        }
                    }));
                    return (output, error);
                }
            }

            //var info = new ProcessStartInfo
            //{
            //    FileName = this.UtilityPath,
            //    Arguments = $"{command} {uri}",
            //    UseShellExecute = false,
            //    RedirectStandardOutput = true,
            //    CreateNoWindow = true
            //};

            //// Azureの場合は、youtube-dl.exeが動かないので、pipでインストールした実ライブラリを直接キックする
            //var pythonPath = this.PythonPath;
            //Trace.TraceInformation($"★{pythonPath}");
            //if (!string.IsNullOrWhiteSpace(pythonPath))
            //{
            //    var libPath = Path.Combine(Path.GetDirectoryName(pythonPath), "lib", "site-packages", "youtube_dl");
            //    Trace.TraceInformation($"★★{libPath}");

            //    info.FileName = $"{pythonPath}";
            //    info.Arguments = $"{libPath} {command} {uri}";
            //}

            //var p = new Process { StartInfo = info };
            //p.Start();
            //while (!p.StandardOutput.EndOfStream)
            //{
            //    string line = p.StandardOutput.ReadLine();
            //    Trace.TraceInformation($"GetInfo ... {line}");
            //    yield return line;
            //}



            //p.WaitForExit();
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
