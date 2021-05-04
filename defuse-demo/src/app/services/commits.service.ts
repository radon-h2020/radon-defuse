import { Injectable,  Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore'

import { CommitModel } from 'app/models/commit.model';


@Injectable({
  providedIn: 'root',
})
export class CommitsService {

    commitsCollection: AngularFirestoreCollection<CommitModel>;
    commits: Observable<CommitModel[]>;
    commitHashes: string[];
    commitDoc: AngularFirestoreDocument<CommitModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){}

    initializeCommits(repositoryId: string){
        const id = +repositoryId // to number

        this.commits = this.store.collection('commits', ref => ref.where('repository_id', '==', id))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();
                    const msg = data['msg'] !== undefined ? data['msg'] : 'There is no message for this commit.'

                    return {hash: data['hash'], msg: msg, valid: true, defects: []} as CommitModel
                })
            }))
    }

    getAll(): Observable<CommitModel[]>{
        return this.commits;
    }

}


//         this.commitsCollection = this.store.collection('commits');
//         this.commits = this.commitsCollection.snapshotChanges().pipe(map(changes => {
//            return changes.map(item => {
//                const data = item.payload.doc.data();
//                return {hash: data.hash, msg: 'string', valid: true, defects: ['']} as CommitModel})
//         }))



//         this.store.doc('repositories/240532248').get()
//                   .subscribe(async (doc) => {
//                       this.commitHashes = doc.data()['commits'];

//                       const snapshots = await this.store.collection('commits', ref => ref.where('hash', 'in', this.commitHashes)).get();
//                       snapshots.forEach(snapshot => {
//                         snapshot.docs.forEach(doc => {
//                             console.log(typeof(doc))
//                             console.log(doc.data())
//                             this.commits.push({
//                                 hash: data.hash,
//                                 msg: data.msg,
//                                 valid: data.is_valid,
//                                 defects: data.defects
//                             })
//                         })
//                       });

//                       this.commitsCollection = this.store.collection('commits');
//                       this.commits = this.commitsCollection.snapshotChanges().pipe(map(changes => {
//                         return changes.map(item => {
//                             const data = item.payload.doc.data();
//                             return {hash: data.hash, msg: 'string', valid: true, defects: ['']} as CommitModel})
//                       }))
//                   })


//        this.commitsCollection = this.store.collection('commits');

//         this.commits = this.commitsCollection.snapshotChanges().pipe(map(changes => {
//             return changes.map(item => {
//                 const data = item.payload.doc.data();
//
//                 if(commitHashes.includes(data.hash)){
//                     const commit = {
//                         hash: data.hash,
//                         msg: data.msg,
//                         valid: data.is_valid,
//                         defects: data.defects
//                     } as CommitModel
//
//                     return commit
//                 }
//             })
//         }))






// to add fixing commit
//this.store.collection('fixing-commits').doc(commit.hash).set({hash: 'hash1223', types: ['a', 'b']})
