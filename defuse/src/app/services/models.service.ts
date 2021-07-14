import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'

import { PredictiveModel } from 'app/models/predictive-model.model';


@Injectable({
  providedIn: 'root',
})
export class ModelsService {

    repositoryId: number;
    models: Observable<PredictiveModel[]>;
    modelDoc: AngularFirestoreDocument<PredictiveModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){}

    initializeModels(repositoryId: number){
        this.repositoryId = repositoryId

        this.models = this.store.collection('models', ref => ref.where('repository_id', '==', this.repositoryId))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();

                    return {
                        id: item.payload.doc.id,
                        defect: data['defect'],
                        language: data['language'],
                        averagePrecision: data['average_precision'],
                        mcc: data['mcc'],
                        //
                        createdAt: data['created_at'],
                    } as PredictiveModel
                })
            }))
    }

    getAll(): Observable<PredictiveModel[]>{
        return this.models;
    }

    getReport(modelId: string): Observable<any>{
        const URL = `/api/report?model_id=${modelId}`;
        return this.httpClient.get<any>(URL, {observe:'response'}).pipe(
                map(response => {
                    const body = response['body']

                    let overall = {}
                    let series = {}

                    for (let evaluationMeasure in body['splits']) {
                            let data = []

                            Object.entries(body['splits'][evaluationMeasure]).forEach(([key,value]) => {
                                const roundedValue = Math.round(+value * Math.pow(10, 2)) / Math.pow(10, 2);
                                data.push({x: +key+1, y: roundedValue})
                            })

                            series[evaluationMeasure] = [{
                                name: evaluationMeasure,
                                data: data
                            }]
                    }

                    for (let evaluationMeasure in body['overall']) {
                        const roundedValue = Math.round(+body['overall'][evaluationMeasure] * Math.pow(10, 2)) / Math.pow(10, 2);
                        overall[evaluationMeasure] = roundedValue
                    }

                    return {performance: {series, overall}}
                })
           );
    }

    deleteModel(id: string): Observable<any>{
        const URL = `/api/model?id=${id}`;
        return this.httpClient.delete<any>(URL, {observe:'response'});
    }
}
