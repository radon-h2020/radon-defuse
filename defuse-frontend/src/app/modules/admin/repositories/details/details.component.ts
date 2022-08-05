import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Repository } from 'app/modules/admin/repositories/repositories.types';
import { RepositoriesComponent } from 'app/modules/admin/repositories/repositories.component';
import { RepositoriesService } from 'app/modules/admin/repositories/repositories.service';

@Component({
    selector       : 'repository-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepositoryDetailsComponent implements OnInit, OnDestroy {
    
    repository: Repository;
    repositoryForm: UntypedFormGroup;
    repositories: Repository[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _repositoriesComponent: RepositoriesComponent,
        private _repositoriesService: RepositoriesService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _snackBar: MatSnackBar
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
        // Open the drawer
        this._repositoriesComponent.matDrawer.open();

        // Get the repository
        this._repositoriesService.getRepository(this._activatedRoute.snapshot.params.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((repository: Repository) => {

                // Open the drawer in case it is closed
                this._repositoriesComponent.matDrawer.open();

                // Get the repository
                this.repository = repository;

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

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._repositoriesComponent.matDrawer.close();
    }

    onDeleteRepository(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete repository',
            message: 'Are you sure you want to delete this repository? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' ) {

                this._repositoriesService.deleteRepository(this.repository.id)
                    .subscribe((response) => {

                        // Return if the repository wasn't deleted...
                        if ( response.status != 204 ) {
                            this._snackBar.open('Could not delete the repository', 'Dismiss', { duration: 3000 });
                            return;
                        } else {                            
                            this._snackBar.open('Repository deleted', 'Dismiss', { duration: 3000 });
                            this.closeDrawer()
                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                        }

                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    onCalculateMetrics(): void{
        this._repositoriesService.calculateMetrics(this.repository)
            .subscribe((response) => {

                if ( response.status != 204 ) {
                    this._snackBar.open('Could not calculate metrics', 'Dismiss', { duration: 3000 });
                } else {                            
                    this._snackBar.open('Scoring started. You will see the updates soon', 'Dismiss', { duration: 3000 });
                    this.closeDrawer()
                    this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                }
            });

                // Mark for check
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
        return item.id || index;
    }
}