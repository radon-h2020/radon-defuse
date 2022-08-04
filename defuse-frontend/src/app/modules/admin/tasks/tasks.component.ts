import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService } from '@fuse/components/navigation';
import { Task } from 'app/modules/admin/tasks/tasks.types';
import { TasksService } from 'app/modules/admin/tasks/tasks.service';

@Component({
    selector       : 'tasks-list',
    templateUrl    : './tasks.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksComponent implements OnInit, OnDestroy {

    tasks$: Observable<Task[]>;
    tasksCount: any = {
        completed : 0,
        in_progress: 0,
        failed: 0,
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _tasksService: TasksService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the tasks
        this.tasks$ = this._tasksService.tasks$
        this._tasksService.getTasks()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Task[]) => {

                // Update the counts
                this.tasksCount.completed = tasks.filter(task => task.completed).length;
                this.tasksCount.failed = tasks.filter(task => task.failed).length;
                this.tasksCount.in_progress = tasks.filter(task => task.in_progress).length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    onDelete(task){
        this._tasksService.deleteTask(task)
            .subscribe(deleted => this._changeDetectorRef.markForCheck());
    }

    /**
    Visualize task's log
    @param id: task id
    */
    onVisualizeLog(taskId){
        // this._tasksService.getLog(taskId)
        //     .subscribe(log => {
        //         // Open Dialog and show log
        //         let dialogRef = this._dialog.open(TaskLogDialogComponent, {
        //             width: '100%',
        //             height: '90%',
        //             data: { log: log }
        //         });
        // });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}