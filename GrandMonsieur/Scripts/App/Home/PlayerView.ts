namespace GrandMonsieur.Home {
    import UIElement = DomBehind.UIElement;
    export class PlayerView extends DomBehind.BizView {

        constructor() {
            super();


        }

        BuildBinding(): void {
            let builder = this.CreateBindingBuilder<PlayerViewModel>();

            builder.Element(".player_frame")
                .Binding(UIElement.SrcProperty, x => x.Uri);

            
        }

    }
}