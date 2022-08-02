import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AnnotatorComponent } from 'app/modules/admin/annotator/annotator.component';
import { AnnotatorService } from 'app/modules/admin/annotator/annotator.service';
import { RepositoriesService } from 'app/modules/admin/repositories/repositories.service';

import { Commit, FixedFile } from 'app/modules/admin/annotator/annotator.types';
import { Repository } from 'app/modules/admin/repositories/repositories.types';


@Component({
    selector       : 'commit-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotatorDetailsComponent implements OnInit, OnDestroy
{   
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    // @Input() commit: Commit
    commit: Commit;
    commitForm: UntypedFormGroup;
    commits: Commit[];
    
    fixedFiles: FixedFile[];
    repository: Repository;
    
    editMode: boolean = false;

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _annotatorComponent: AnnotatorComponent,
        private _annotatorService: AnnotatorService,
        private _repositoriesService: RepositoriesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _commitsComponent: AnnotatorComponent,
        private _fuseConfirmationService: FuseConfirmationService,
        private _overlay: Overlay,
        private _renderer2: Renderer2,
        private _router: Router,
        private _viewContainerRef: ViewContainerRef
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
        this._commitsComponent.matDrawer.open();

        // Get the commits
        // this._annotatorService.commits$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((commits: Commit[]) => {
        //         this.commits = commits;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });

        // Get the commit
        // this._annotatorService.commit$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((commit: Commit) => {

        //         // Open the drawer in case it is closed
        //         this._commitsComponent.matDrawer.open();

        //         // Get the commit
        //         this.commit = commit;

        //         // Get the repository
        //         this._repositoriesService.getRepository(this.commit.repository_id)
        //         .pipe(takeUntil(this._unsubscribeAll))
        //         .subscribe((repository: Repository) => {

        //             // Get the commit
        //             this.repository = repository;

        //             // Mark for check
        //             this._changeDetectorRef.markForCheck();
        //         });

        //         // Get the fixed files
        //         this._annotatorService.getFixedFilesByCommit(this.commit.hash)
        //             .pipe(takeUntil(this._unsubscribeAll))
        //             .subscribe((fixedFiles: FixedFile[]) => {
        //                 this.fixedFiles = fixedFiles;

        //                 // Mark for check
        //                 this._changeDetectorRef.markForCheck();
        //             });
                
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });

        // Get the commit
        this._annotatorService.getCommit(this._activatedRoute.snapshot.params.hash)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((commit: Commit) => {

                // Open the drawer in case it is closed
                this._annotatorComponent.matDrawer.open();

                // Get the repository
                this.commit = commit;

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
        return this._commitsComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open tags panel
     */
    openTagsPanel(): void
    {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass   : '',
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                                .withFlexibleDimensions(true)
                                .withViewportMargin(64)
                                .withLockedPosition(true)
                                .withPositions([
                                    {
                                        originX : 'start',
                                        originY : 'bottom',
                                        overlayX: 'start',
                                        overlayY: 'top'
                                    }
                                ])
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {

            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            if ( this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached() ){
                this._tagsPanelOverlayRef.detach();
            }

            if ( templatePortal && templatePortal.isAttached ){
                templatePortal.detach();
            }
        });
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

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackTagsByFn(index: number, item: any): any
    {
        return item || index;
    }
}