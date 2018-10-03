namespace GrandMonsieur.Shared {
    import UIElement = DomBehind.UIElement;
    export class LayoutView extends AppView {

        constructor() {
            super();
            this.EnsureSwitch("#allow_youtube", "YouTube");
            this.EnsureSwitch("#allow_dailymotion", "dailymotion");
            this.EnsureSwitch("#allow_niconico", "niconico");
        }
        private EnsureSwitch(selector: string, title: string) {
            let sw = $(selector).bootstrapSwitch({
                size: "mini",
                labelText: title,
                labelWidth: "100px",
                state: $.GetLocalStorage(title, true),
            });
            sw.on("switchChange.bootstrapSwitch", (e : any) => {
                let checked = e.target.checked;
                $.SetLocalStorage(title, checked);

                AppMediator.TargetSiteChanged.Raise(this, { site: title, checked: checked });
            });
        }

        BuildBinding(): void {
            let builder = this.CreateBindingBuilder<LayoutViewModel>();

            builder.Element(".site_title")
                .BindingAction(UIElement.Click, x => x.Refresh());
            builder.Element(".search-input")
                .Binding(UIElement.ValueProperty, x => x.SearchString)
                .BindingAction(UIElement.Enter, x => x.Search())
                .BuildSuggest(DomBehind.SuggestSource.Google, 300);

            builder.Element(".search-input-button")
                .BindingAction(UIElement.Click, x => x.Search());

            // バインドしない、直DOM操作は、コードビハインド上でインラインコード
            builder.Element("#menu_toggle")
                .BindingAction(UIElement.Click, x => {
                    let body = $("body");
                    let sidebar = $("#sidebar-menu");
                    if (body.hasClass("nav-md")) {
                        sidebar.find('li.active ul').hide();
                        sidebar.find('li.active').addClass('active-sm').removeClass('active');
                    } else {
                        sidebar.find('li.active-sm ul').show();
                        sidebar.find('li.active-sm').addClass('active').removeClass('active-sm');
                    }
                    body.toggleClass('nav-md nav-sm');
                });


            // バインドしない、直DOM操作はインラインコード
            builder.Element("#sidebar-menu a")
                .BindingAction(UIElement.Click, (x, e: JQueryEventObject) => {
                    let body = $("body");
                    let sidebar = $("#sidebar-menu");
                    let li = $(e.target).parent();
                    let uriIdentity = li.data("identity");
                    if (!String.IsNullOrWhiteSpace(uriIdentity)) {
                        this.MenuClick(li, uriIdentity);
                    }

                    if (li.is(".active")) {
                        li.removeClass('active active-sm');
                        $('ul:first', li).slideUp();
                    }
                    else {
                        if (!li.parent().is('.child_menu')) {
                            sidebar.find('li').removeClass('active active-sm');
                            sidebar.find('li ul').slideUp();
                        }
                        else {
                            if (body.is(".nav-sm")) {
                                li.parent().find("li").removeClass("active active-sm");
                                li.parent().find("li ul").slideUp();
                            }
                        }
                        li.addClass('active');
                        $('ul:first', li).slideDown();
                    }
                });




        }

        /**
         * メニューの選択状態を更新する
         */
        protected UpdateMenu() {
            let currentViewIdentity = this.CurrentViewIdentity;

            // 選択
            let sideMenu = $('#sidebar-menu');
            let nodes = sideMenu.find("li.current-page");
            if (nodes.length !== 0) {
                $.each(nodes, (i, value) => {
                    let node = $(value);
                    if (node.data("identity")) {
                        node.removeClass('active active-sm current-page');
                    }

                });
            }

            sideMenu.find(`a[data-identity="${currentViewIdentity}"]`).parent("li").addClass('current-page');

            // ノードを開く
            sideMenu.find("li").filter(function (i, e) {
                let me = $(e);
                let identity = me.data("identity");
                return identity === currentViewIdentity;
            }).addClass('current-page').parents('ul').slideDown().parent().addClass('active');
        }

        protected /* virtual */  MenuClick(li: JQuery, uriIdentity: string) {

            NProgress.start();

            let oldPathName = location.pathname;
            let oldDom = $($('.main > div:not([display=none])')[0]);

            if (!oldDom.hasClass('menu-cache')) {
                oldDom.addClass('menu-cache');
                oldDom.attr("data-menu-cache", oldPathName);

                oldDom.attr("data-menu-cache-id", oldDom.attr("id"));
                oldDom.removeAttr("id");
            }


            let newDom = $(`.menu-cache[data-menu-cache="/${uriIdentity}"]`);
            if (newDom.length !== 0) {
                $('.menu-cache').hide();

                history.replaceState("", "", $.AbsoluteUri(uriIdentity));
                // history.replaceState("", "", '/' + uriIdentity);

                newDom.attr("id", newDom.attr("data-menu-cache-id"));
                newDom.show();

                setTimeout(() => {
                    this.UpdateMenu();
                    setTimeout(() => NProgress.done(), 300);
                }, 1);

                return;
            }

            let uri = $.AbsoluteUri(uriIdentity);
            this.Get(uri).done((dom: string) => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(dom, "text/html");
                let body = $(doc.body);


                let renderSection = body.find(".main > div");
                renderSection.addClass('menu-cache');
                renderSection.attr('data-menu-cache', `/${uriIdentity}`);

                $('.menu-cache').hide();

                history.replaceState("", "", $.AbsoluteUri(uriIdentity));
                //history.replaceState("", "", '/' + uriIdentity);

                $(".main").append(renderSection);

                let script = body.find("script").last();
                let source = script.html();
                let s = document.createElement("script");
                s.type = "text/javascript";
                s.innerHTML = source;
                document.body.appendChild(s);

                this.UpdateMenu();
            }).fail(error => {
                // viewが取得できなかった
                console.error(error);

            }).always(() => {
                setTimeout(() => NProgress.done(), 300);
            });
        }

        protected Get(url: string): JQueryPromise<any> {
            let d = $.Deferred();

            $.ajax({
                type: "GET",
                url: url,
                async: true
            }).done(x => d.resolve(x)).fail(x => d.reject(x));

            return d.promise();
        }

    }
}