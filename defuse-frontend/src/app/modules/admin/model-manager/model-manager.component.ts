import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'model-manager',
    templateUrl    : './model-manager.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelManagerComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}