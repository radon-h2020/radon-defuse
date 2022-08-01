import { ChangeDetectionStrategy, 
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
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Commit, Pagination } from 'app/modules/admin/annotator/annotator.types';
import { AnnotatorService } from 'app/modules/admin/annotator/annotator.service'
import { StartMiningDialog } from './dialogs/start.component';
import { Repository } from '../repositories/repositories.types';
import { RepositoriesService } from '../repositories/repositories.service';

@Component({
    selector     : 'annotator',
    templateUrl  : './annotator.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotatorComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;

    drawerMode: 'side' | 'over';
    commits$: Observable<Commit[]>;

    filteredCommits: Commit[];
    filteredCommitsCount: number = 0;

    pagination: Pagination
    
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
        private _annotatorService: AnnotatorService,
        private _repositoriesService: RepositoriesService,
        private _changeDetectorRef: ChangeDetectorRef,
        public _dialog: MatDialog,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _router: Router)
    {
        this.pagination = {
            length: 0,
            index: 0,
            size: 0 
        }
    }

    setRepositories(){
        // Get the repositories to display in the menu
        this.repositories$ = this._repositoriesService.repositories$;
        this._repositoriesService.repositories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((repositories: Repository[]) => {

                this.repositoriesCount = repositories.length;
                
                if(repositories.length) {
                    this.selectedRepository = repositories[0]
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    setCommits(){
        // Get the commits
        this.commits$ = this._annotatorService.commits$;

        // Filter commits
        this._annotatorService.commits$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((commits: Commit[]) => {

                // this.pagination.length = this.filteredCommitsCount
                // this.pagination.index = 0
                // this.pagination.size = this._paginator.pageSize

                this.filteredCommits = commits.filter(commit => commit.repository_id == this.selectedRepository.id);
                this.filteredCommitsCount = this.filteredCommits.length
                
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    setCommit(){
        // Get the commit
        this._annotatorService.commit$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((commit: Commit) => {

                // Update the selected commit
                // this.selectedCommit = commit;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On init
     */
    ngOnInit(): void{
        this.setRepositories()
        this.setCommits()
        this.setCommit()


        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            switchMap(query =>
                // Search
                // this._annotatorService.searchCommits(query)
                this._annotatorService.getCommits(0, 10, query)
            )
        ).subscribe();

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if ( !opened )
            {
                // Remove the selected contact when drawer closed
                this.selectedCommit = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Get the pagination
        this._annotatorService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            
        // Get commits if page changes
        this._paginator.page.pipe(
            switchMap(() => {
                this.matDrawer.close();
                // this.isLoading = true;
                return this._annotatorService.getCommits(this._paginator.pageIndex, this._paginator.pageSize);
            })            
        ).subscribe();




        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) => {

            // Set the drawerMode if the given breakpoint is active
            if ( matchingAliases.includes('lg') ) {
                this.drawerMode = 'side';
            } else {
                this.drawerMode = 'over';
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
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
        // this._router.navigate(['./'], {relativeTo: this._activatedRoute});
        this.matDrawer.close();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    filterCommits(repository): void {
        this.matDrawer.close();

        this.selectedRepository = repository

        this._annotatorService.commits$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((commits: Commit[]) => {
                this.filteredCommits = commits.filter(commit => commit.repository_id == this.selectedRepository.id);
                this.filteredCommitsCount = this.filteredCommits.length

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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

    toggleCommitValidity(commit: Commit): void {
        const targetCommit = this.filteredCommits.find(item => item.hash === commit.hash)
        targetCommit.is_valid = !targetCommit.is_valid;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.hash || index;
    }

    trackRepositoriesByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
