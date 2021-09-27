import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NgApexchartsModule } from 'ng-apexcharts';


import { DialogAnalyticsComponent } from './dialog-analytics/dialog-analytics.component';
import { DialogTrainModelComponent } from './dialog-train-model/dialog-train-model.component';
import { ModelManagerComponent } from './model-manager.component';
import { ModelManagerDetailsComponent } from './details/details.component';

export const modelManagerRoutes: Route[] = [
    {
        path     : '',
        component: ModelManagerComponent,
    }
];

@NgModule({
    declarations: [
        DialogAnalyticsComponent,
        DialogTrainModelComponent,
        ModelManagerComponent,
        ModelManagerDetailsComponent
    ],
    imports     : [
        RouterModule.forChild(modelManagerRoutes),
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSidenavModule,
        MatSelectModule,
        MatSnackBarModule,
        MatTooltipModule,
        SharedModule,

        //
        MatButtonToggleModule,
        MatDividerModule,
        MatMenuModule,
        MatProgressBarModule,
        MatTableModule,
        NgApexchartsModule,
    ]
})
export class ModelManagerModule
{
}
