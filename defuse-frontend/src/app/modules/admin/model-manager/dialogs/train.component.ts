import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { DefectsService } from '../../annotator/annotator.service';
import { Defect } from '../../annotator/annotator.types';
import { RepositoriesService } from '../../repositories/repositories.service';
import { Repository } from '../../repositories/repositories.types';

export interface DialogViewItem {
    value: string,
    viewValue: string
}


@Component({
  selector: 'dialog-train-model',
  templateUrl: './train.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TrainModelDialog implements OnInit, OnDestroy {

    languages = [
        {value: 'ansible', viewValue: 'Ansible'},
        {value: 'tosca', viewValue: 'Tosca'}
    ]

    metrics = [
        {value: 'product', viewValue: 'Product'},
        {value: 'process', viewValue: 'Process'}
    ]

    validations = [
        {value: 'release', viewValue: 'Per release'},
        {value: 'commit', viewValue: 'Per commit'}
    ]

    defects: DialogViewItem[]
    repositories: DialogViewItem[]

    selectedRepository: string;
    selectedDefect: string;
    selectedLanguage: string;
    selectedMetrics: string;
    selectedValidation: string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(
        @Inject(MAT_DIALOG_DATA) data: { repository: Repository },
        private _changeDetectorRef: ChangeDetectorRef,
        private _defectsService: DefectsService,
        private _repositoriesService: RepositoriesService
    ) {
        
        if (data && data.repository){
            this.repositories = [{ value: data.repository.id, viewValue: data.repository.full_name }]
            this.selectedRepository = this.repositories[0].value;
        }

        this.selectedLanguage = this.languages[0].value;
        this.selectedMetrics = this.metrics[0].value;
        this.selectedValidation = this.validations[0].value;
    }

    ngOnInit(): void {

        // Get defects
        this._defectsService.getDefects()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((defects: Defect[]) => {
                this.defects = []

                defects.forEach(defect => this.defects.push({ value: defect.title, viewValue: defect.title } as DialogViewItem ));

                this.selectedDefect = this.defects[0].value;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if ( !this.selectedRepository ){

            // Get repositories
            this._repositoriesService.getRepositoriesPage(0, 10000)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(response => {
                    this.repositories = []

                    response.repositories.forEach(repo => this.repositories.push({ value: repo.id, viewValue: repo.full_name } as DialogViewItem ));

                    this.selectedRepository = this.repositories[0].value;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

}