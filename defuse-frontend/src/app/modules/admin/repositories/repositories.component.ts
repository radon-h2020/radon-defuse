import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { Repository, RepositoryPagination } from 'app/modules/admin/repositories/repositories.types';
import { RepositoriesService } from 'app/modules/admin/repositories/repositories.service'
import { AddRepositoryDialog } from './dialogs/add.component';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/tasks.types';
import { CollectRepositoriesDialog } from './dialogs/collect.component';

@Component({
    selector     : 'repositories',
    templateUrl  : './repositories.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepositoriesComponent implements AfterViewInit, OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    isCollectingRepositories: boolean
    progressbarValue: number = 1

    pagination: RepositoryPagination;

    repositories$: Observable<Repository[]>
    repositoriesCount: number = 0;
    selectedRepository: Repository;

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        public _dialog: MatDialog,
        private _repositoriesService: RepositoriesService,
        private _router: Router,
        private _tasksService: TasksService)
    {
    }

    private getRepositories(pageIndex: number = 0, pageSize: number=10) {
        this._repositoriesService.getRepositoriesPage(pageIndex, pageSize)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.repositoriesCount = response.pagination.length
                this._changeDetectorRef.markForCheck();
            });
    }

    
    /**
     * On init
     */
    ngOnInit(): void {

        // Get the pagination
        this._repositoriesService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: RepositoryPagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        this.repositories$ = this._repositoriesService.repositories$
        
        // Subscribe to repositories changes
        this.getRepositories()

        // Get the contact
        this._repositoriesService.repository$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((repository: Repository) => {

                // Update the selected contact
                this.selectedRepository = repository;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>
                    this._repositoriesService.searchRepositories(query)
                )
            ).subscribe();

        
        // Subscribe to 'in progress' tasks to observe Crawl task
        this._tasksService.getTasksInProgress()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Task[]) => {        
                const task = tasks.find(task => task.name == 'crawling')
                if ( task ){
                    this.isCollectingRepositories = true
                    this.progressbarValue = task.progress_value > 0 ? task.progress_value : 1
                } else {
                    this.isCollectingRepositories = false
                    this.progressbarValue = 1
                }

                this._changeDetectorRef.markForCheck();
            })
        
        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if ( !opened )
            {
                // Remove the selected repository when drawer closed
                this.selectedRepository = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if ( this._paginator ) {

            // Get repositories if page changes
            this._paginator.page.pipe(
                switchMap(() => {
                    return this._repositoriesService.getRepositoriesPage(this._paginator.pageIndex, this._paginator.pageSize);
                })
            ).subscribe();
        }
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

    /**
     * On backdrop clicked
     */
     onBackdropClicked(): void {

        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
     }


    /**
     * Add repository
     */
    onAddRepository(): void {

        // Open dialog to add repository info
        let dialogRef = this._dialog.open(AddRepositoryDialog);
        dialogRef.afterClosed().subscribe(result => {
            
            if(result && result.url){
                // Create the repository
                this._repositoriesService.createRepository(result.url, result.token).subscribe((newRepository) => {
                    
                    if(this._router.url.endsWith("/repositories")){
                        this._router.navigate(['./', newRepository.id], {relativeTo: this._activatedRoute});
                    }else{
                        this._router.navigate(['./', newRepository.id], {relativeTo: this._activatedRoute.parent});
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            }
        })
    }

    onCollectRepositories(): void {
        let dialogRef = this._dialog.open(CollectRepositoriesDialog);
        dialogRef.afterClosed().subscribe(selection => {
            if( selection && selection.token ){
                this._repositoriesService.collectRepositories(selection.token, selection.start, selection.end, selection.pushedAfter, selection.language, selection.minStars, selection.minReleases)
                    .subscribe(response => {

                        if (response.status && response.status == 202 ) {
                            this.isCollectingRepositories = true
                            // this._snackBar.open('Repository collection started!', 'Dismiss', { duration: 3000, });
                        } else {
                            this.isCollectingRepositories = false
                            // this._snackBar.open('Could not delete the repository', 'Dismiss', { duration: 3000 });
                        }

                });
            }
        })
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
