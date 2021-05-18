import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DialogTrainModelComponent } from './dialog-train-model/dialog-train-model.component';
import { PredictiveModel } from 'app/models/predictive-model.model';

import { ModelsService } from 'app/services/models.service';
import { TasksService } from 'app/services/tasks.service';

@Component({
  selector: 'app-model-manager',
  templateUrl: './model-manager.component.html',
  styleUrls: ['./model-manager.component.scss']
})
export class ModelManagerComponent implements OnInit {

    repositoryId: string

    models: PredictiveModel[];
    selectedModel: PredictiveModel;

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    constructor(private _activatedRoute: ActivatedRoute,
                private _modelsService: ModelsService,
                private _tasksService: TasksService,
                private _dialog: MatDialog,
                private _snackBar: MatSnackBar) {

        this.repositoryId = this._activatedRoute.snapshot.paramMap.get("id");
        this._modelsService.initializeModels(this.repositoryId)
        this._tasksService.initializeTasks(this.repositoryId)

        this._modelsService.getAll().subscribe(models => {
            this.models = models
        });
    }

    ngOnInit(): void {
    }

    closeDrawer(): void {
        this.matDrawer.close();
    }

    goToModel(id: string): void {
        this.selectedModel = this.models.find(model => model.id === id)
        this.matDrawer.open();
    }

    onDelete(){
        this._modelsService.deleteModel(this.selectedModel.id).subscribe(response => {
            console.log('response', response.status)
            this.closeDrawer()
        })
    }

    onDownload(){
        const URL = `/api/model?id=${this.selectedModel.id}`;
        var hiddenElement = document.createElement('a');
        hiddenElement.href = URL;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${this.selectedModel.id}.joblib`;
        hiddenElement.click();
    }

    onTrain(defect: string, language: string){
        this._tasksService.train(defect, language).subscribe(response => {
            let message = ''

            if(response.status === 202){
                message = 'Model building started...'
            }else{
                message = 'Some errors have occurred!'
            }

            this._snackBar.open(message, 'Dismiss', {
                duration: 5000,
                panelClass: ['custom-snack-bar']
            });
        })
    }

    openTrainDialog(){
        let dialogRef = this._dialog.open(DialogTrainModelComponent);
        dialogRef.afterClosed().subscribe(result => {
            if(result.defect !== undefined && result.language !== undefined){
                this.onTrain(result.defect, result.language)
            }
        })
    }

}
