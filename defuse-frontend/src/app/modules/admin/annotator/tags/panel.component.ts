import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { CommitsService } from '../annotator.service';
import { Commit } from '../annotator.types';

@Component({
  selector: 'tags-panel',
  templateUrl: './panel.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TagsPanelComponent{

    @Input() commit: Commit
        
    tags: string[];
    filteredTags: string[];
    tagsEditMode: boolean = false

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _annotatorService: CommitsService,
        private _changeDetectorRef: ChangeDetectorRef,
    ){ }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the tags
        this._annotatorService.defects$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((defects: string[]) => {
                this.tags = defects;
                this.filteredTags = defects;

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

    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.toLowerCase().includes(value));
    }

    addTagToCommit(tag: string): void {
        // Add the tag
        this.commit.defects.unshift(tag);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
 
    removeTagFromCommit(tag: string): void {
        // Remove the tag
        this.commit.defects.splice(this.commit.defects.findIndex(item => item === tag), 1);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    shouldShowCreateTagButton(inputValue: string): boolean {
        return !(inputValue === '' || this.tags.findIndex(tag => tag.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

    toggleCommitTag(tag: string): void {
        if ( this.commit.defects.includes(tag) ){
            this.removeTagFromCommit(tag);
        } else {
            this.addTagToCommit(tag);
        }
    }

    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    createTag(tag: string): void {
        // Create tag on the server
        this._annotatorService.createTag(tag)
            .subscribe((response) => {

                // Add the tag to the contact
                this.addTagToCommit(response);
            });
    }
 
    deleteTag(tag: string): void {
        // Delete the tag from the server
        this._annotatorService.deleteTag(tag).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateTag(tag: string, event): void {
        // Update the title on the tag
        let updatedTag = event.target.value;

        // Update the tag on the server
        this._annotatorService.updateTag(tag, updatedTag)
            .pipe(debounceTime(300))
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item || index;
    }
}