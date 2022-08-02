import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { CommitsService, FixedFilesService } from '../annotator.service';
import { Commit, FixedFile } from '../annotator.types';

@Component({
    selector: 'fixed-files-list',
    templateUrl: './fixed-files.component.html',
    encapsulation: ViewEncapsulation.None
  })
export class FixedFilesComponent{

    @Input() commit: Commit
    fixedFiles$: Observable<FixedFile[]>;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _fixedFilesService: FixedFilesService,
        private _changeDetectorRef: ChangeDetectorRef,
    ){ }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        
        this._fixedFilesService.commit = this.commit.hash

        // Get the fixed files
        this.fixedFiles$ = this._fixedFilesService.fixedFiles$
        this._fixedFilesService.getFixedFiles()
                               .pipe(takeUntil(this._unsubscribeAll))
                               .subscribe((response) => {
                                //    this.commitsCount = response.pagination.length
                                   this._changeDetectorRef.markForCheck();
                               });

        // this._fixedFilesService.fixedFiles$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((fixedFiles: FixedFile[]) => {
        //         // this.fixedFiles = fixedFiles;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    onToggleFileValidity(file: FixedFile): void {
        this._fixedFilesService.updateFixedFile(file)
        this._changeDetectorRef.markForCheck();
    }
}
   