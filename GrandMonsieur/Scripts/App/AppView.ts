namespace GrandMonsieur {

    export abstract class AppView extends DomBehind.BizView {
        protected get CurrentUri(): string {
            return window.location.href.split('#')[0].split('?')[0];
        }

        protected get CurrentViewIdentity(): string {
            let relative = this.CurrentUri.Replace($.GetRootUri(), "");
            return relative;
        }

        protected get Navigator(): DomBehind.Navigation.INavigator {
            let app = DomBehind.Application.Current;
            return app.Navigator;
        }
    }

}