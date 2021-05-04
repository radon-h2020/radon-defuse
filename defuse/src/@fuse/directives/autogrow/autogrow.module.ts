import { NgModule } from '@angular/core';
import { FuseAutogrowDirective } from '@fuse/directives/autogrow/autogrow.directive';

@NgModule({
    declarations: [
        FuseAutogrowDirective
    ],
    exports     : [
        FuseAutogrowDirective
    ]
})
export class FuseAutogrowModule
{
}
