import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, of, Observable, map, switchMap, take } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { uniq } from 'lodash'

import { Item, Items, PredictiveModel } from 'app/modules/admin/model-manager/model-manager.types';
import { Repository } from '../repositories/repositories.types';


@Injectable({
  providedIn: 'root',
})
export class ModelManagerService {

    private _item: BehaviorSubject<Item | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<Items | null> = new BehaviorSubject(null);

    private _modelsCollection: Observable<PredictiveModel[]>;
    
    private _model: BehaviorSubject<PredictiveModel | null> = new BehaviorSubject(null);
    private _models: BehaviorSubject<PredictiveModel[] | null> = new BehaviorSubject([]);

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


    get models$(): Observable<PredictiveModel[]> {
        return this._models.asObservable();
    }

    get model$(): Observable<PredictiveModel> {
        return this._model.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    getItems(folderId: string | null = null): Observable<Items> {

        return this._modelsCollection.pipe(
            switchMap((models) => {
                let repositoryIds = folderId ? [folderId] : uniq(models.map(model => model.repository_id))

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


    getModelsByRepository(id: string): Observable<PredictiveModel[]> {
        return this._modelsCollection = this._firestore.collection('models', ref => ref.where('repository_id', '==', id)).snapshotChanges().pipe(map(changes => {
            return changes.map(item => {
                const model = item.payload.doc.data() as PredictiveModel;
                model.id = item.payload.doc.id
                return model
            })
        })).pipe(
            map((models) => {
                this._models.next(models);
                return models
            })
        );  


        // // See if the folder id exist
        // const folderId = request.params.get('folderId') === 'null' ? null : request.params.get('folderId');

        // // Filter the items by folder id. If folder id is null,
        // // that means we want to root items which have folder id
        // // of null
        // items = items.filter(item => item.folderId === folderId);

        // // Separate the items by folders and files
        // const folders = items.filter(item => item.type === 'folder');
        // const files = items.filter(item => item.type !== 'folder');

        // // Sort the folders and files alphabetically by filename
        // folders.sort((a, b) => a.name.localeCompare(b.name));
        // files.sort((a, b) => a.name.localeCompare(b.name));

        // // Figure out the path and attach it to the response
        // // Prepare the empty paths array
        // const pathItems = cloneDeep(this._items);
        // const path = [];

        // // Prepare the current folder
        // let currentFolder = null;

        // // Get the current folder and add it as the first entry
        // if ( folderId )
        // {
        //     currentFolder = pathItems.find(item => item.id === folderId);
        //     path.push(currentFolder);
        // }

        // // Start traversing and storing the folders as a path array
        // // until we hit null on the folder id
        // while ( currentFolder?.folderId )
        // {
        //     currentFolder = pathItems.find(item => item.id === currentFolder.folderId);
        //     if ( currentFolder )
        //     {
        //         path.unshift(currentFolder);
        //     }
        // }

        // return [
        //     200,
        //     {
        //         folders,
        //         files,
        //         path
        //     }
        // ];
    }

    getModel(id: string): Observable<PredictiveModel> {
        return this._models.pipe(
            take(1),
            map((models) => {
                const model = models.find(model => model.id === id) || null;
                this._model.next(model);
                return model
            })
        )
    }

    deleteModel(model: PredictiveModel): Observable<any>{
        const URL = `/backend-api/model?id=${model.id}`;
        return this._httpClient.delete<any>(URL, {observe:'response'});
    }
}