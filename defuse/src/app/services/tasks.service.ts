import { Injectable,  Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore'

import { TaskModel } from 'app/models/task.model';


@Injectable({
  providedIn: 'root',
})
export class TasksService {

    tasksollection: AngularFirestoreCollection<TaskModel>;
    tasks: Observable<TaskModel[]>;
    taskDoc: AngularFirestoreDocument<TaskModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){}

    initializeTasks(repositoryId: string){
        const id = +repositoryId // to number

        this.tasks = this.store.collection('tasks', ref => ref.where('repository_id', '==', id))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();

                    return {
                        id: item.payload.doc.id,
                        name: data['name'],
                        status: data['status']} as TaskModel
                })
            }))
    }

    getAll(): Observable<TaskModel[]>{
        return this.tasks;
    }

    mine(): void{
        console.log('In mining.')

        this.httpClient.get('api/mine').subscribe(response => {
                console.log(response)
        })
    }
}
