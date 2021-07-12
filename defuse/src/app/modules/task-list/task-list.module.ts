import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TaskListComponent } from './task-list.component';
import { TaskItemComponent } from './task-item.component';
import { TaskLogDialogComponent } from './dialog-log/dialog-log.component';


const taskListRoutes: Route[] = [
    {
        path     : '',
        component: TaskListComponent
    }
];

@NgModule({
    declarations: [
        TaskListComponent,
        TaskItemComponent,
        TaskLogDialogComponent
    ],
    imports     : [
        RouterModule.forChild(taskListRoutes),
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        ScrollingModule
    ]
})
export class TaskListModule
{
}
