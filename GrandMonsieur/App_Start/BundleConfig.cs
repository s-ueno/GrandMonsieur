﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Optimization;

namespace GrandMonsieur
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            // site all css bundles
            bundles.Add(new StyleBundle("~/bundles/css").Include(Css));

            // site nuget js bundles
            bundles.Add(new ScriptBundle("~/bundles/nuget-js").Include(NugetJs));

            // application js bundles
            bundles.Add(new ScriptBundle("~/bundles/app-js").Include(AppJs));
        }

        public static readonly string[] Css = new string[] {
             "~/Content/bootstrap*",
             "~/Content/themes/base/all.css",
             "~/Content/jquery.ui.layout.css",
             "~/Content/font-awesome.css",
             "~/Content/bootstrap-switch/bootstrap3/bootstrap-switch.css",
             "~/Content/nprogress.css",
             "~/Content/custom.css",
             "~/Content/Site.css",
        };

        public static readonly string[] NugetJs = new string[] {
            "~/Scripts/bootstrap.js",
            "~/Scripts/jquery-{version}.js",
            "~/Scripts/jquery.validate*",
            "~/Scripts/jquery-ui*",
            "~/Scripts/nprogress.js",

            "~/Scripts/collections.js",
            "~/Scripts/bootstrap-switch.js",
            "~/Scripts/dombehind.js",
            "~/Scripts/domBehind.plugin.jqueryui.js",
        };

        public static readonly string[] AppJs = new string[] {
            "~/Scripts/App/App.js",
            "~/Scripts/App/Startup.js",
            "~/Scripts/App/SupportSites.js",
            "~/Scripts/App/AppMediator.js",

            "~/Scripts/App/Widget/Movie.js",
            "~/Scripts/App/Widget/MovieHistory.js",

            "~/Scripts/App/AppViewModel.js",
            "~/Scripts/App/AppView.js",
            "~/Scripts/App/MovieInfo.js",
            "~/Scripts/App/History.js",

            // shared
            "~/Scripts/App/Shared/WebServiceProxy.js",
            "~/Scripts/App/Shared/LayoutViewModel.js",
            "~/Scripts/App/Shared/LayoutView.js",

            "~/Scripts/App/Home/WebServiceProxy.js",
            "~/Scripts/App/Home/HomeViewModel.js",
            "~/Scripts/App/Home/HomeView.js",
            "~/Scripts/App/Home/PlayerViewModel.js",
            "~/Scripts/App/Home/PlayerView.js",

            "~/Scripts/App/History/HistoryViewModel.js",
            "~/Scripts/App/History/HistoryView.js",

            "~/Scripts/App/Download/DownloadViewModel.js",
            "~/Scripts/App/Download/DownloadView.js",


        };
    }
}
