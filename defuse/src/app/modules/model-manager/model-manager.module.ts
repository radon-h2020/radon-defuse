import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';

import { ModelManagerComponent } from './model-manager.component';


export const modelManagerRoutes: Route[] = [
    {
        path     : '',
        component: ModelManagerComponent
    }
];

@NgModule({
    declarations: [
        ModelManagerComponent
    ],
    imports     : [
        RouterModule.forChild(modelManagerRoutes),
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatTooltipModule,
        SharedModule
    ]
})
export class ModelManagerModule
{
}
