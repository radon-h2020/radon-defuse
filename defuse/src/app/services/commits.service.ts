import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'

import { CommitModel } from 'app/models/commit.model';


@Injectable({
  providedIn: 'root',
})
export class CommitsService {

    commits: Observable<CommitModel[]>;
    commitDoc: AngularFirestoreDocument<CommitModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){}

    initializeCommits(repositoryId: string){
        const id = +repositoryId // to number

        this.commits = this.store.collection('commits', ref => ref.where('repository_id', '==', id))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();
                    const msg = data['msg'] !== undefined ? data['msg'] : 'There is no message for this commit.'

                    return {hash: data['hash'], msg: msg, is_valid: data['is_valid'], defects: data['defects']} as CommitModel
                })
            }))
    }

    getAll(): Observable<CommitModel[]>{
        return this.commits;
    }

    patchIsValid(commit: CommitModel): Observable<boolean>{
        commit.is_valid = !commit.is_valid
        this.commitDoc = this.store.doc(`commits/${commit.hash}`);
        this.commitDoc.update(commit);
        return of(true)
    }
}
