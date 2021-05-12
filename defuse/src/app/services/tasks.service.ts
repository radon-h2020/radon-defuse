import { Injectable,  Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore'

import { TaskModel } from 'app/models/task.model';


@Injectable({
  providedIn: 'root',
})
export class TasksService {

    repositoryId: number;
    tasks: Observable<TaskModel[]>;
    taskDoc: AngularFirestoreDocument<TaskModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){}

    initializeTasks(repositoryId: string){
        this.repositoryId = +repositoryId // to number

        this.tasks = this.store.collection('tasks', ref => ref.where('repository_id', '==', this.repositoryId))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();

                    return {
                        id: item.payload.doc.id,
                        name: data['name'],
                        language: data['language'],
                        started_at: Math.ceil(data['started_at']),
                        ended_at: data['ended_at'],
                        completed: data['status'] == 'completed',
                        failed: data['status'] == 'failed',
                        in_progress: data['status'] == 'progress'
                    } as TaskModel
                })
            }))
    }

    getAll(): Observable<TaskModel[]>{
        return this.tasks;
    }

    mine(language: string): Observable<any> {
        const URL = `/api/mine?id=${this.repositoryId}&language=${language}`;
        return this.httpClient.get<any>(URL, {observe:'response'})
    }
}
