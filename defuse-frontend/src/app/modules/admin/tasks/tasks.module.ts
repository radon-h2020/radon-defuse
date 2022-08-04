import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { TasksComponent } from 'app/modules/admin/tasks/tasks.component';
import { TaskLogDialog } from 'app/modules/admin/tasks/dialogs/log.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

const tasksRoutes: Route[] = [
    {
        path     : '',
        component: TasksComponent,
    }
];

@NgModule({
    declarations: [
        TasksComponent,
        TaskLogDialog
    ],
    imports     : [
        RouterModule.forChild(tasksRoutes),
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        ScrollingModule,
        SharedModule
    ]
})
export class TasksModule
{
}