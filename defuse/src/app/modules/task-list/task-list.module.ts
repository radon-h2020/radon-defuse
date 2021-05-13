import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

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
        MatIconModule
    ]
})
export class TaskListModule
{
}
