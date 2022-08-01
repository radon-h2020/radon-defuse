import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
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
export class RepositoryDetailsComponent implements OnInit, OnDestroy
{
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
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Open the drawer
        this._repositoriesComponent.matDrawer.open();


        // Get the repositories
        // this._repositoriesService.repositories$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((repositories: Repository[]) => {
        //         this.repositories = repositories;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });

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
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._repositoriesComponent.matDrawer.close();
    }

   
    /**
     * Delete the repository
     */
    deleteRepository(): void
    {
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
            if ( result === 'confirmed' )
            {
                // Get the current repository's id
                const id = this.repository.id;

                // Get the next/previous repository's id
                const currentRepositoryIndex = this.repositories.findIndex(item => item.id === id);
                const nextRepositoryIndex = currentRepositoryIndex + ((currentRepositoryIndex === (this.repositories.length - 1)) ? -1 : 1);
                const nextRepositoryId = (this.repositories.length === 1 && this.repositories[0].id === id) ? null : this.repositories[nextRepositoryIndex].id;

                // Delete the repository
                // this._repositoriesService.deleteRepository(id)
                //     .subscribe((isDeleted) => {

                //         // Return if the repository wasn't deleted...
                //         if ( !isDeleted )
                //         {
                //             return;
                //         }

                //         // Navigate to the next repository if available
                //         if ( nextRepositoryId )
                //         {
                //             this._router.navigate(['../', nextRepositoryId], {relativeTo: this._activatedRoute});
                //         }
                //         // Otherwise, navigate to the parent
                //         else
                //         {
                //             this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                //         }

                //     });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }


    calculateMetrics(){
        return false // TODO
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