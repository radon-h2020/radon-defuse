import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

import { Task } from 'app/modules/admin/tasks/tasks.types';

@Injectable({
  providedIn: 'root',
})
export class TasksService {

    private _tasksCollection: Observable<Task[]>;
    private _tasks: BehaviorSubject<Task[] | null> = new BehaviorSubject([]);

    constructor(private _httpClient: HttpClient, private _firestore: AngularFirestore){
      this._tasksCollection = _firestore.collection('tasks', ref => ref.orderBy('started_at','desc')).snapshotChanges().pipe(map(changes => {
        return changes.map(item => {
            const data = item.payload.doc.data()
            
            const task = data as Task;
            task.id = item.payload.doc.id
            task.completed = data['status'] == 'completed',
            task.failed = data['status'] == 'failed',
            task.in_progress = data['status'] == 'progress'

            return task
        })
      }))
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get tasks$(): Observable<Task[]> {
      return this._tasks.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    getTasks(): Observable<Task[]> {
      return this._tasksCollection.pipe(
          map((tasks) => {
              this._tasks.next(tasks);
              return tasks
          })
      );      
    }

    mine(repositoryId: string, language: string): Observable<any> {
        const URL = `/backend-api/mine?id=${repositoryId}&language=${language}`;
        return this._httpClient.get<any>(URL, {observe:'response'})
    }

}