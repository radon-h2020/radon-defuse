import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, of, Observable, map, switchMap, take, throwError } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { uniq } from 'lodash'

import { Item, Items, PredictiveModel } from 'app/modules/admin/model-manager/model-manager.types';
import { Repository } from '../repositories/repositories.types';
import { repositories } from 'app/mock-api/apps/repositories/data';


@Injectable({
  providedIn: 'root',
})
export class ModelManagerService {

    private _item: BehaviorSubject<Item | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<Items | null> = new BehaviorSubject(null);

    private _modelsCollection: Observable<PredictiveModel[]>;

    constructor(private _httpClient: HttpClient, private _firestore: AngularFirestore){
        this._modelsCollection = _firestore.collection('models').snapshotChanges().pipe(map(changes => {
            return changes.map(item => {
                const model = item.payload.doc.data() as PredictiveModel;
                model.id = item.payload.doc.id
                return model
            })
        }))
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get items$(): Observable<Items> {
        return this._items.asObservable();
    }

    get item$(): Observable<Item> {
        return this._item.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    deleteModel(id: string): Observable<any>{
        const URL = `/backend-api/model?id=${id}`;
        return this._httpClient.delete<any>(URL, {observe:'response'});
    }

    downloadModel(id: string): void{
        
        const URL = `/backend-api/model?id=${id}`;
        const a = document.createElement('a');
        a.href = URL;
        a.target = '_blank';
        a.download = `${id}.joblib`;
        a.click();
        window.URL.revokeObjectURL(URL);
        a.remove();
    }
    
    getAnalytics(modelId: string): Observable<any>{
        const URL = `/backend-api/report?model_id=${modelId}`;
        return this._httpClient.get<any>(URL, {observe:'response'}).pipe(
                map(response => {
                    const body = response['body']

                    let overall = {}
                    let series = {}

                    for (let evaluationMeasure in body['series']) {
                            let data = []

                            Object.entries(body['series'][evaluationMeasure]).forEach(([key,value]) => {
                                const roundedValue = Math.round(+value * Math.pow(10, 2)) / Math.pow(10, 2);
                                data.push({x: +key+1, y: roundedValue})
                            })

                            series[evaluationMeasure] = data
                    }

                    for (let evaluationMeasure in body['overall']) {
                        const roundedValue = Math.round(+body['overall'][evaluationMeasure] * Math.pow(10, 2)) / Math.pow(10, 2);
                        overall[evaluationMeasure] = roundedValue
                    }
                    
                    const aucPR = {
                        overallAucPR  : overall['auc-pr'],
                        numReleases   : series['auc-pr'].length,
                        series        : [
                            {
                                name: 'AucPR',
                                data: series['auc-pr']
                            }
                        ]
                    }
                    
                    
                    const mcc = {
                        overallMcc  : overall['mcc'],
                        numReleases   : series['mcc'].length,
                        series        : [
                            {
                                name: 'MCC',
                                data: series['mcc']
                            }
                        ]
                    }
                    
                    const precisionVsRecall = {
                        overallPrecision  : overall['precision'],
                        overallRecall : overall['recall'],
                        numReleases   : series['precision'].length,
                        series        : [
                            {
                                name: 'Precision',
                                data: series['precision']
                            },
                            {
                                name: 'Recall',
                                data: series['recall']
                            }
                        ]
                    }

                    return { aucPR, mcc, precisionVsRecall }
                })
           );
    }
    
    getItems(folderId: string | null = null): Observable<Items> {

        return this._modelsCollection.pipe(
            switchMap((models) => {
                let repositoryIds = folderId ? [folderId] : uniq(models.map(model => model.repository_id))

                if ( models.length == 0 ){
                    this._items.next({ folders: [], files: [] } as Items);
                    return throwError( 'There are no models' )
                }

                return combineLatest(
                    of(models),
                    combineLatest(
                        repositoryIds.map(id =>
                            this._firestore.collection<Repository>('repositories', ref => ref.where('id', '==', id)).valueChanges().pipe(
                                map(repositories => repositories[0])
                            )
                        )
                    )
                )
            }),
            map(([models, repositories]) => {

                if ( folderId ){

                    models = models.filter(model => model.repository_id == folderId)
                    return models.map(model => {
                        return {
                            id: model.id,
                            folderId: folderId,
                            folderName: repositories.find(repo => repo.id == folderId).full_name,
                            name: `${model.language} ${model.defect}`,
                            type: 'joblib'
                        } as Item
                    })
                
                } else {
                    return repositories.map(repo => {
                        return {
                            id: repo.id,
                            folderId: null,
                            name: repo.full_name,
                            type: 'folder'
                        } as Item
                    });
                }
            }),
            map((result: Item[]) => { 


                const foldersCount = result.filter(item => item.type == 'folder').length
                result.sort((a, b) => a.name.localeCompare(b.name));

                let items = foldersCount == 0 ? 
                {
                    folders: [],
                    files: result,
                } as Items 
                :
                {
                    folders: result,
                    files: [],
                } as Items

                this._items.next(items)
                return items
            })
        );  
    }

    getItemById(id: string): Observable<Item> {
        return this._items.pipe(
            take(1),
            map((items) => {

                // Find within the folders and files
                const item = [...items.folders, ...items.files].find(value => value.id === id) || null;

                // Update the item
                this._item.next(item);

                // Return the item
                return item;
            }),
            switchMap((item) => {

                if ( !item )
                {
                    return throwError('Could not found the item with id of ' + id + '!');
                }

                return of(item);
            })
        );
    }
}