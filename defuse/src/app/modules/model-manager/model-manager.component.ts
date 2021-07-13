import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DialogAnalyticsComponent } from './dialog-analytics/dialog-analytics.component';
import { DialogTrainModelComponent } from './dialog-train-model/dialog-train-model.component';
import { PredictiveModel } from 'app/models/predictive-model.model';

import { ModelsService } from 'app/services/models.service';
import { TasksService } from 'app/services/tasks.service';

import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


export interface Item {
    type: 'file' | 'folder';
    name: string;
    content?: any;
}

export interface Items
{
    folders: Item[];
    files: Item[];
}

@Component({
  selector: 'app-model-manager',
  templateUrl: './model-manager.component.html',
  styleUrls: ['./model-manager.component.scss']
})
export class ModelManagerComponent implements OnInit {
    drawerMode: 'side' | 'over';

    repositoryId: string;
    folder: string;

    models: PredictiveModel[];
    items: Items
    selectedItem: Item

    private _unsubscribeAll: Subject<any> = new Subject<any>();


    selectedModel: PredictiveModel;

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    constructor(private _activatedRoute: ActivatedRoute,
                private _changeDetectorRef: ChangeDetectorRef,
                private _modelsService: ModelsService,
                private _tasksService: TasksService,
                private _dialog: MatDialog,
                private _dialog_analytics: MatDialog,
                private _router: Router,
                private _snackBar: MatSnackBar) {

        this.repositoryId = this._activatedRoute.snapshot.paramMap.get("id");

        this._activatedRoute.queryParams.subscribe(params => {
            if(params.folder){
                this.folder = params.folder
            }else{
                this.folder = null
            }

            this.onRefreshItems()
        });

        this._modelsService.initializeModels(this.repositoryId)
        this._tasksService.initializeTasks(this.repositoryId)

        this._modelsService.getAll().subscribe(models => {
            this.models = models
            this.onRefreshItems()
        });
    }

    ngOnInit(): void {
        this.onRefreshItems()
    }

    onRefreshItems(){
        this.items = {
            folders: [],
            files: []
        }

        if(this.models === undefined){
            return
        }

        this.models.forEach(model => {
            if(this.folder === null){
                const folderExists = this.items.folders.some( ({name}) => name == model.language)
                if(!folderExists){
                    this.items.folders.push({
                        type: 'folder',
                        name: model.language
                    })
                }
            }else{
                if(model.language.toLowerCase() == this.folder.toLowerCase()){
                    this.items.files.push({
                        type: 'file',
                        name: model.defect,
                        content: model
                    })
                }
            }
        });
    }

    onCloseDrawer(): void {
        this.matDrawer.close();
        this.selectedModel = undefined;
    }

    /**
     * Go to item
     *
     * @param id
     */
    goToItem(item: Item): void {

        if(item.type == 'folder'){

            // Get the current activated route
            let route = this._activatedRoute;
            while ( route.firstChild ) {
                route = route.firstChild;
            }

            // Go to item
            this._router.navigate(['./'], {relativeTo: route, queryParams: { folder: item.name } });

        }else{
            this.selectedItem = item
            this.matDrawer.open()
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Get the current activated route
        let route = this._activatedRoute;
        while ( route.firstChild )
        {
            route = route.firstChild;
        }

        // Go back to the parent route
        this._router.navigate(['../'], {relativeTo: route});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    onDelete(){
        this._modelsService.deleteModel(this.selectedItem.content.id).subscribe(response => {
            this.onCloseDrawer()
        })
    }

    onDownload(){
        const id = this.selectedItem.content.id
        const defect = this.selectedItem.content.defect
        const language = this.selectedItem.content.language

        const URL = `/api/model?id=${id}`;
        var hiddenElement = document.createElement('a');
        hiddenElement.href = URL;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${language}-${defect}.joblib`;
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

    openAnalyticsDialog(modelId: string){
        this._modelsService.getReport(this.selectedItem.content.id).subscribe(report => {

            // Open Dialog and show log
            this._dialog_analytics.open(DialogAnalyticsComponent, {
                width: '100%',
                height: '85%',
                data: report //{ data: report }
            });
        })
    }

    openTrainDialog(){
        let dialogRef = this._dialog.open(DialogTrainModelComponent);
        dialogRef.afterClosed().subscribe(result => {
            if(result && result.defect !== undefined && result.language !== undefined){
                this.onTrain(result.defect, result.language)
            }
        })
    }
}
