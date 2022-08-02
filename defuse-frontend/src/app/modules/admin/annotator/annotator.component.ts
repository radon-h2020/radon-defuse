import { AfterViewInit,
         ChangeDetectionStrategy, 
         ChangeDetectorRef, 
         Component, 
         OnDestroy, 
         OnInit, 
         ViewChild, 
         ViewEncapsulation } from '@angular/core';

import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator';
import { Observable, map, Subject, switchMap, take, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Commit, CommitsPagination } from 'app/modules/admin/annotator/annotator.types';
import { CommitsService } from 'app/modules/admin/annotator/annotator.service'
import { StartMiningDialog } from './dialogs/start.component';
import { Repository, RepositoryPagination } from '../repositories/repositories.types';
import { RepositoriesService } from '../repositories/repositories.service';

@Component({
    selector     : 'annotator',
    templateUrl  : './annotator.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotatorComponent implements AfterViewInit, OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    drawerMode: 'side' | 'over';
    commits$: Observable<Commit[]>;
    commitsCount: number = 0;

    filteredCommits: Commit[];
    filteredCommitsCount: number = 0;

    pagination: CommitsPagination
    
    repositories$: Observable<Repository[]>;   
    repositoriesCount: number = 0;

    selectedCommit: Commit;
    selectedRepository: Repository;

    searchInputControl: UntypedFormControl = new UntypedFormControl();
   
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _commitsService: CommitsService,
        private _repositoriesService: RepositoriesService,
        private _changeDetectorRef: ChangeDetectorRef,
        public _dialog: MatDialog,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _router: Router)
    {
    }

    private getCommits() {
        this._commitsService.getCommitsPage(this.selectedRepository.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.commitsCount = response.pagination.length
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On init
     */
    ngOnInit(): void {
        
        // Get the repositories
        this.repositories$ = this._repositoriesService.repositories$
        this._repositoriesService.getRepositoriesPage(0, 1000)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if ( response.pagination.length ){
                    this.onSelectRepository(response.repositories[0])
                }
                this._changeDetectorRef.markForCheck();
            });

        // Bind commits$ to the service's observable
        this.commits$ = this._commitsService.commits$;

        // Get the pagination
        this._commitsService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CommitsPagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>
                    this._commitsService.searchCommits(query)
                )
            ).subscribe();


        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if ( !opened ) {
                // Remove the selected contact when drawer closed
                this.selectedCommit = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Get the pagination
        this._commitsService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CommitsPagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if ( this._paginator ) {

            // Get products if sort or page changes
            this._paginator.page.pipe(
                switchMap(() => {
                    return this._commitsService.getCommitsPage(this.selectedRepository.id, this._paginator.pageIndex, this._paginator.pageSize);
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

    onSelectRepository(repository){
        this.selectedRepository = repository
        this._commitsService.repositoryId = this.selectedRepository.id;
        this.getCommits()
    }

    onToggleCommitValidity(commit: Commit): void {
        this._commitsService.toggleCommitValidity(commit)
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add repository
     */
    startMining(): void {

        // Open dialog to add repository info
        let dialogRef = this._dialog.open(StartMiningDialog);
        dialogRef.afterClosed().subscribe(result => {
            if(result && result.url){
                // do something
            }
        })
    }


    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackCommitsByFn(index: number, item: any): any {
        return item.hash || index;
    }

    trackRepositoriesByFn(index: number, item: any): any {
        return item.id || index;
    }
}
