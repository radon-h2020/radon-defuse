import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'

import { TaskModel } from 'app/models/task.model';


@Injectable({
  providedIn: 'root',
})
export class TasksService {

    repositoryId: number;
    tasks: Observable<TaskModel[]>;
    taskDoc: AngularFirestoreDocument<TaskModel>;

    constructor(private httpClient: HttpClient,
                private store: AngularFirestore){}

    initializeTasks(repositoryId: number){

        if(this.repositoryId === repositoryId){
            return
        }

        this.repositoryId = repositoryId

        this.tasks = this.store.collection('tasks', ref => ref.where('repository_id', '==', this.repositoryId))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();

                    return {
                        id: item.payload.doc.id,
                        name: data['name'],
                        language: data['language'],
                        defect: data['defect'] ? data['defect'] : undefined,
                        validation: data['validation'] ? data['validation'] : undefined,
                        started_at: Math.ceil(data['started_at']),
                        ended_at: data['ended_at'],
                        completed: data['status'] == 'completed',
                        failed: data['status'] == 'failed',
                        in_progress: data['status'] == 'progress'
                    } as TaskModel
                })
            }))
    }

    deleteTask(taskId: string): Observable<boolean>{
        this.taskDoc = this.store.doc(`tasks/${taskId}`);
        this.taskDoc.delete();

        // TODO delete only if task's status is failed
        return this.httpClient.delete<boolean>(`/api/log?task_id=${taskId}`)
        return of(true)
    }

    getAll(): Observable<TaskModel[]>{
        return this.tasks;
    }

    getLog(taskId: string): Observable<string>{
        const URL = `/api/log?task_id=${taskId}`;
        return this.httpClient.get<string>(URL)
    }

    mine(language: string): Observable<any> {
        const URL = `/api/mine?id=${this.repositoryId}&language=${language}`;
        return this.httpClient.get<any>(URL, {observe:'response'})
    }

    train(defect: string, language: string, validation: string, metrics: string): Observable<any> {
        const URL = `/api/train?id=${this.repositoryId}&defect=${defect}&language=${language}&validation=${validation}&metrics=${metrics}`;
        return this.httpClient.get<any>(URL, {observe:'response'})
    }
}
