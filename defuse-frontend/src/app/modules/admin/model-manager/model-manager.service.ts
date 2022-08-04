import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { PredictiveModel } from 'app/modules/admin/model-manager/model-manager.types';


@Injectable({
  providedIn: 'root',
})
export class ModelsService {

    private _modelsCollection: Observable<PredictiveModel[]>;
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
    get models$(): Observable<PredictiveModel[]> {
        return this._models.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    getModels(): Observable<PredictiveModel[]> {
        return this._modelsCollection.pipe(
            map((models) => {
                this._models.next(models);
                return models
            })
        );      
      }

    deleteModel(model: PredictiveModel): Observable<any>{
        const URL = `/backend-api/model?id=${model.id}`;
        return this._httpClient.delete<any>(URL, {observe:'response'});
    }
}