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
        protected string UtilityPath { get; private set; }
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

        protected void OnDownloading(String message)
        {
            Downloding?.Invoke(this, new DownloaderMessageEventArgs(message));
        }
        protected void OnErrorLogging(String message)
        {
            ErrorLogging?.Invoke(this, new DownloaderMessageEventArgs(message));
        }

        public async Task Do(string uri, string savePath)
        {
            // --output \"~/ Desktop /% (title)s.% (ext)s\"
            var (fileName, arguments) = CreateCommand($"--output {savePath} -f best ", uri);
            Trace.TraceInformation($"★★★{fileName}★★★{arguments}");
            await ExecuteAsync(fileName, arguments, message =>
            {
                OnDownloading(message);

            }, error =>
            {
                OnErrorLogging(error);
            });
        }

        public async Task<string> GetFileNameAsync(string uri)
        {
            return (await GetInfoAsync("-f best --get-filename ", uri)).FirstOrDefault();
        }

        public async Task<string> GetExtensionAsync(string uri)
        {
            var allInfo = (await GetInfoAsync("--list-format", uri)).ToArray();
            var best = allInfo.FirstOrDefault(x => x.Contains("(best)")) ?? allInfo.FirstOrDefault();
            if (string.IsNullOrWhiteSpace(best)) return null;

            var ext = new string(best.Skip(13).Take(3).ToArray()).Trim();
            return ext;
        }

        protected async Task<IEnumerable<string>> GetInfoAsync(string command, string uri)
        {
            var (fileName, arguments) = CreateCommand(command, uri);
            var result = await ExecuteAsync(fileName, arguments);
            return result.Log;
        }

        protected (string FileName, string Arguments) CreateCommand(string command, string uri)
        {
            var execPath = Path.Combine(UtilityPath, "youtube-dl.exe");
            var args = $"{command} {uri}";

            // Azureの場合は、youtube-dl.exeが動かないので、pipでインストールした実ライブラリを直接キックする
            var pythonPath = PythonPath;
            if (!string.IsNullOrWhiteSpace(pythonPath))
            {
                var libPath = Path.Combine(Path.GetDirectoryName(pythonPath), "lib", "site-packages", "youtube_dl");
                execPath = pythonPath;
                args = $"{libPath} {command} {uri}";
            }
            return (execPath, args);
        }

        protected async Task<(IEnumerable<string> Log, IEnumerable<string> Error)> ExecuteAsync(string fileName, string arguments,
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
