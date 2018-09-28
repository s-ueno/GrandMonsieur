using Codeplex.Data;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace GrandMonsieur.Core
{
    public static class Utils
    {
        public static T AppSettings<T>(string key, T defaultValue = default(T))
        {
            T result = defaultValue;
            try
            {
                NameValueCollection appSettings = ConfigurationManager.AppSettings;
                string value = appSettings.Get(key);
                if (!string.IsNullOrEmpty(value))
                {
                    result = (T)((object)TypeDescriptor.GetConverter(typeof(T)).ConvertFrom(value));
                }
            }
            catch
            {
            }
            return result;
        }


        public static dynamic JsonRead(string url, params (string Name, string Value)[] cookie)
        {
            var request = (HttpWebRequest)WebRequest.Create(url);
            var cookieContainer = new CookieContainer();

            if (cookie != null)
            {
                foreach (var each in cookie)
                {
                    cookieContainer.Add(new Cookie(each.Name, each.Value));
                }
            }
            request.CookieContainer = cookieContainer;
            var response = request.GetResponse();
            return DynamicJson.Parse(response.GetResponseStream());
        }


        public static byte[] ReadFully(Stream input)
        {
            byte[] buffer = new byte[16 * 1024];
            using (MemoryStream ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }

        internal static string ToQueryString(this YoutubeVideoType type)
        {
            var list = new List<string>();
            if (type.HasFlag(YoutubeVideoType.channel))
            {
                list.Add("channel");
            }
            if (type.HasFlag(YoutubeVideoType.playlist))
            {
                list.Add("playlist");
            }
            if (type.HasFlag(YoutubeVideoType.video))
            {
                list.Add("video");
            }
            return string.Join(",", list);
        }
    }
}
