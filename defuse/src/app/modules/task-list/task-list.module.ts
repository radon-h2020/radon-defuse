import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TaskListComponent } from './task-list.component';
import { TaskItemComponent } from './task-item.component';


const taskListRoutes: Route[] = [
    {
        path     : '',
        component: TaskListComponent
    }
];

@NgModule({
    declarations: [
        TaskListComponent,
        TaskItemComponent
    ],
    imports     : [
        RouterModule.forChild(taskListRoutes),
        CommonModule,
        MatIconModule,
        MatTooltipModule
    ]
})
export class TaskListModule
{
}
