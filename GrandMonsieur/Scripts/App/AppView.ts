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

        protected DateDiff(x) {
            if (!x) return null;

            let date = new Date(x);
            let now = new Date(Date.now());

            let diff = now.getTime() - date.getTime();
            let daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                return "Today";
            }
            return `${daysDiff} days ago`;
        }
        protected Views(x) {
            return `${numeral(x).format("0,0")} views`;
        }
        
    }

}