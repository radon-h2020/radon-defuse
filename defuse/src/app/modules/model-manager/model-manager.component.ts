import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';

import { ModelsService } from 'app/services/models.service';
import { PredictiveModel } from 'app/models/predictive-model.model';

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
                private _modelsService: ModelsService) {

        this.repositoryId = this._activatedRoute.snapshot.paramMap.get("id");
        this._modelsService.initializeModels(this.repositoryId)

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

}
