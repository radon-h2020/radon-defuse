import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';

import { DialogTrainModelComponent } from './dialog-train-model/dialog-train-model.component';
import { ModelManagerComponent } from './model-manager.component';


export const modelManagerRoutes: Route[] = [
    {
        path     : '',
        component: ModelManagerComponent
    }
];

@NgModule({
    declarations: [
        DialogTrainModelComponent,
        ModelManagerComponent
    ],
    imports     : [
        RouterModule.forChild(modelManagerRoutes),
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSidenavModule,
        MatSelectModule,
        MatSnackBarModule,
        MatTooltipModule,
        SharedModule
    ]
})
export class ModelManagerModule
{
}
