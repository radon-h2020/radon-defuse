import { Component, ViewEncapsulation } from '@angular/core';
import { FuseAnimations } from '@fuse/animations';

@Component({
    selector     : 'auth-confirmation-required',
    templateUrl  : './confirmation-required.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : FuseAnimations
})
export class AuthConfirmationRequiredComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
