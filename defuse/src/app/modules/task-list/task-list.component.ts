import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TaskModel } from 'app/models/task.model'
import { TasksService } from 'app/services/tasks.service'

@Component({
  selector: 'app-tasks',
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {
    repositoryId: string

    tasks: TaskModel[];
    tasksCount: any = {
        completed : 0,
        incomplete: 0
    };

    constructor(private activatedRoute: ActivatedRoute,
                private tasksService: TasksService) {

        this.repositoryId = this.activatedRoute.snapshot.paramMap.get("id");
        this.tasksService.initializeTasks(this.repositoryId)

        this.tasksService.getAll().subscribe(tasks => {
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

    ngOnInit(): void {
    }

}
