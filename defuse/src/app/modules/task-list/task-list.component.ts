import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { TaskLogDialogComponent } from './dialog-log/dialog-log.component'
import { TaskModel } from 'app/models/task.model'
import { TasksService } from 'app/services/tasks.service'

@Component({
  selector: 'app-tasks',
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {

    repositoryId: number;
    tasks: TaskModel[];
    tasksCount: any = {
        completed : 0,
        incomplete: 0
    };

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _dialog: MatDialog,
        private _tasksService: TasksService
    ) {}

    ngOnInit(): void {
        this.repositoryId = +this._activatedRoute.snapshot.paramMap.get("id");
        this._tasksService.initializeTasks(this.repositoryId)

        this._tasksService.getAll().subscribe(tasks => {

            // Sort by ascending started_at date
            tasks.sort(function(item1, item2) {
              return item2['started_at'] - item1['started_at'];
            });

            // Count complete and incomplete tasks
            this.tasksCount.incomplete = 0
            for(let task of tasks){
                this.tasksCount.incomplete += task.in_progress ? 1 : 0
            }

            this.tasksCount.completed = tasks.length - this.tasksCount.incomplete
            this.tasks = tasks
        });
    }

    /**
    Remove a task
    @param id: task id
    */
    onDelete(id){
        this._tasksService.deleteTask(id)
            .subscribe(deleted => {});
    }

    /**
    Visualize task's log
    @param id: task id
    */
    onVisualizeLog(taskId){
        this._tasksService.getLog(taskId)
            .subscribe(log => {
                // Open Dialog and show log
                let dialogRef = this._dialog.open(TaskLogDialogComponent, {
                    width: '100%',
                    height: '90%',
                    data: { log: log }
                });
        });
    }

    trackTaskById(index: number, task: TaskModel): string { return task.id; }
}
