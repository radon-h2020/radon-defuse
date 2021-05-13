import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TaskListComponent } from './task-list.component';


const taskListRoutes: Route[] = [
    {
        path     : '',
        component: TaskListComponent
    }
];

@NgModule({
    declarations: [
        TaskListComponent
    ],
    imports     : [
        RouterModule.forChild(taskListRoutes),
        CommonModule,
//         MatButtonModule,
         MatChipsModule,
//         MatFormFieldModule,
//         MatGridListModule,
         MatIconModule,
//         MatInputModule,
//         MatPaginatorModule,
//         MatSnackBarModule,
//         MatTableModule,
//         MatTabsModule,
//         MatToolbarModule,
//         MatTooltipModule
    ]
})
export class TaskListModule
{
}
