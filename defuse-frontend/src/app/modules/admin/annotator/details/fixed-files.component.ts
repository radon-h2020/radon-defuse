import { ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FixedFilesService } from '../annotator.service';
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
                               .subscribe(() => {
                                   this._changeDetectorRef.markForCheck();
                               });
    }

    onToggleFileValidity(file: FixedFile): void {
        this._fixedFilesService.updateFixedFile(file)
        this._changeDetectorRef.markForCheck();
    }
}
   