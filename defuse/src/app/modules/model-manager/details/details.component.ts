import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'model-manager-details',
  templateUrl: './details.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ModelManagerDetailsComponent{
    @Input() item;
    @Output() delete = new EventEmitter<string>();
    @Output() dismiss = new EventEmitter<string>();
    @Output() download = new EventEmitter<string>();

    onDelete(){
        this.delete.emit();
    }
    onDismiss(){
        this.dismiss.emit();
    }
    onDownload(){
        this.download.emit();
    }
}


// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
// import { MatDrawerToggleResult } from '@angular/material/sidenav';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { ModelManagerComponent } from './../model-manager.component';
// import { ModelsService } from 'app/services/models.service';
// import { Item } from './../model-manager.component';
//
// @Component({
//     selector       : 'file-manager-details',
//     templateUrl    : './details.component.html',
//     encapsulation  : ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class ModelManagerDetailsComponent implements OnInit, OnDestroy
// {
//     item: Item;
//     private _unsubscribeAll: Subject<any> = new Subject<any>();
//
//     /**
//      * Constructor
//      */
//     constructor(
//         private _changeDetectorRef: ChangeDetectorRef,
//         private _fileManagerListComponent: ModelManagerComponent,
//         private _fileManagerService: ModelsService
//     ) {
//         this.item = { name: 'dependencies', id: '1234435', type:'file'}
//     }
//
//     // -----------------------------------------------------------------------------------------------------
//     // @ Lifecycle hooks
//     // -----------------------------------------------------------------------------------------------------
//
//     /**
//      * On init
//      */
//     ngOnInit(): void
//     {
//         // Open the drawer
//         this._fileManagerListComponent.matDrawer.open();
//
//         // Get the item
//         this.item = {}
//
//         // Mark for check
//         this._changeDetectorRef.markForCheck();
//
//         console.log(this.item)
//     }
//
//     /**
//      * On destroy
//      */
//     ngOnDestroy(): void
//     {
//         // Unsubscribe from all subscriptions
//         this._unsubscribeAll.next();
//         this._unsubscribeAll.complete();
//     }
//
//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------
//
//     /**
//      * Close the drawer
//      */
//     closeDrawer(): Promise<MatDrawerToggleResult>
//     {
//         return this._fileManagerListComponent.matDrawer.close();
//     }
//
//     /**
//      * Track by function for ngFor loops
//      *
//      * @param index
//      * @param item
//      */
//     trackByFn(index: number, item: any): any
//     {
//         return item.id || index;
//     }
// }
