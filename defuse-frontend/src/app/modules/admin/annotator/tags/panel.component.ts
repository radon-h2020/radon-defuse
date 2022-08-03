import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { CommitsService, DefectsService } from '../annotator.service';
import { Commit, Defect } from '../annotator.types';

@Component({
  selector: 'tags-panel',
  templateUrl: './panel.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TagsPanelComponent{

    @Input() commit: Commit
    @Output() onDefectsChanged = new EventEmitter<any>();

    defects: Defect[]

    tagsEditMode: boolean = false

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _commitsService: CommitsService,
        private _defectsService: DefectsService,
        private _changeDetectorRef: ChangeDetectorRef,
    ){ 
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Initialize repositoryId for the commits service
        this._commitsService.repositoryId = this.commit.repository_id
        
        // Bind defects$ to the service's observable and get them
        // this.defects$ = this._defectsService.defects$
        this._defectsService.getDefects()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((defects) => {
                this.defects = defects
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
    addDefectToCommit(defect: Defect): void {
        this._commitsService.addDefectToCommit(this.commit, defect);
        this._changeDetectorRef.markForCheck();

        // Notify parent component
        this.onDefectsChanged.emit()
    }

    removeDefectFromCommit(defect: Defect): void {
        // Remove the tag
        this._commitsService.removeDefectFromCommit(this.commit, defect);

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Notify parent component
        this.onDefectsChanged.emit()
    }

    createDefect(title: string): void {
        // Create tag on the server
        this._defectsService.createDefect(title)
            .subscribe((defect) => {
                // Add the tag to the contact
                this.addDefectToCommit(defect);
            });
    }

    deleteDefect(defect: Defect): void {
        // Delete the tag from the server
        this._defectsService.deleteDefect(defect)
        this.removeDefectFromCommit(defect);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    filterDefects(event): void {
        this._defectsService.searchDefects(event.target.value.toLowerCase())
    }

    onToggleCommitTag(defect: Defect): void {
        if ( this.commit.defects.includes(defect.title) ){
            this.removeDefectFromCommit(defect);
        } else {
            this.addDefectToCommit(defect);
        }
    }

    onToggleDefectsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    shouldShowCreateDefectButton(inputValue: string): boolean {
        return !(inputValue === '' || this.defects.findIndex(defect => defect.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}