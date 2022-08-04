import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { TasksComponent } from 'app/modules/admin/tasks/tasks.component';


const tasksRoutes: Route[] = [
    {
        path     : '',
        component: TasksComponent,
    }
];

@NgModule({
    declarations: [
        TasksComponent,
    ],
    imports     : [
        RouterModule.forChild(tasksRoutes),
        MatCheckboxModule,
        MatIconModule,
        MatTooltipModule,
        SharedModule
    ]
})
export class TasksModule
{
}