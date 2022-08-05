import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Item, Items } from 'app/modules/admin/model-manager/model-manager.types';
import { ModelManagerService } from 'app/modules/admin/model-manager/model-manager.service';
import { TrainModelDialog } from '../dialogs/train.component';
import { TasksService } from '../../tasks/tasks.service';

@Component({
    selector       : 'model-manager-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelManagerListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem: Item;
    items: Items;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        public _dialog: MatDialog,
        private _router: Router,
        private _modelManagerService: ModelManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _snackBar: MatSnackBar,
        private _tasksService: TasksService
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
        
        this._changeDetectorRef.markForCheck();

        // Get the items
        this._modelManagerService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: Items) => {
                this.items = items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the item
        this._modelManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) => {
                this.selectedItem = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media query change
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

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
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    onTrainModel(): void {

        let dialogRef = this._dialog.open(TrainModelDialog);
        dialogRef.afterClosed().subscribe(selection => {
            if( selection && selection.repository && selection.defect && selection.language && selection.validation && selection.metrics ){

                this._tasksService.train(
                    selection.repository, 
                    selection.defect, 
                    selection.language, 
                    selection.validation, 
                    selection.metrics).subscribe(response => {

                    let message = ''
        
                    if (response.status === 202) {
                        message = 'Mining started'
                    } else {
                        message = 'Some errors have occurred'
                    }
        
                    this._snackBar.open(message, 'Dismiss', { duration: 3000 });
                })
            }
        })
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