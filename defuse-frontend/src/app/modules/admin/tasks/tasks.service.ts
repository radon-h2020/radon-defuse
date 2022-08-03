import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Task } from 'app/modules/admin/tasks/tasks.types';

@Injectable({
  providedIn: 'root',
})
export class TasksService {

    constructor(private _httpClient: HttpClient, private _firestore: AngularFirestore){
    }

    mine(repositoryId: string, language: string): Observable<any> {
        const URL = `/backend-api/mine?id=${repositoryId}&language=${language}`;
        return this._httpClient.get<any>(URL, {observe:'response'})
    }

}