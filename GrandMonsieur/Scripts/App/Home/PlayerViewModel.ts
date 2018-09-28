namespace GrandMonsieur.Home {
    export class PlayerViewModel extends AppViewModel {

        public Uri: string;
        Initialize(): void {
            this.Uri = $.GetDomStorage("Player_Uri", "");
        }
    }
}