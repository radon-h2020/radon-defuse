import { Injectable,  Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore'

import { PredictiveModel } from 'app/models/predictive-model.model';


@Injectable({
  providedIn: 'root',
})
export class ModelsService {

    repositoryId: number;
    models: Observable<PredictiveModel[]>;
    modelDoc: AngularFirestoreDocument<PredictiveModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){}

    initializeModels(repositoryId: string){
        this.repositoryId = +repositoryId // to number

        this.models = this.store.collection('models', ref => ref.where('repository_id', '==', this.repositoryId))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();

                    return {
                        id: item.payload.doc.id,
                        defect: data['defect'],
                        language: data['language'],
                        createdAt: data['created_at']
                    } as PredictiveModel
                })
            }))
    }

    getAll(): Observable<PredictiveModel[]>{
        return this.models;
    }

    deleteModel(id: number): Observable<boolean>{
        this.modelDoc = this.store.doc(`models/${id.toString()}`);
        this.modelDoc.delete();
        return of(true)
    }
}
