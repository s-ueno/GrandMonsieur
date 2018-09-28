namespace GrandMonsieur.Home {



    export class InitializeWebProxy
        extends DomBehind.Web.WebService<any, any>{
        protected Url: string = "Home/Initialize";
    }
    export class SearchWebProxy
        extends DomBehind.Web.WebService<any, any>{
        protected Url: string = "Home/Search";
    }
}