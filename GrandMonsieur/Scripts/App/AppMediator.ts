namespace GrandMonsieur {
    // Interaction of common dialogue such as interaction with application portal
    export class AppMediator {
        public static SearchEvent = new DomBehind.TypedEvent<{ search: string, site: SupportSites }>();

        public static TargetSiteChanged = new DomBehind.TypedEvent<{ site: string, checked: boolean }>();
    }
}