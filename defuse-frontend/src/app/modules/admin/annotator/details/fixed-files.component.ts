import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { CommitsService } from '../annotator.service';
import { Commit, FixedFile } from '../annotator.types';

@Component({
    selector: 'fixed-files-list',
    templateUrl: './fixed-files.component.html',
    encapsulation: ViewEncapsulation.None
  })
export class FixedFilesComponent{

    @Input() commit: Commit
    fixedFiles: FixedFile[];

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
    ngOnInit(): void {

        // Get the tags
        this._annotatorService.fixedFiles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((fixedFiles: FixedFile[]) => {
                this.fixedFiles = fixedFiles;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    toggleFileValidity(file: FixedFile): void {
        const targetFile = this.fixedFiles.find(item => item.id === file.id)
        targetFile.is_valid = !targetFile.is_valid;
        this._changeDetectorRef.markForCheck();
    }
}
   