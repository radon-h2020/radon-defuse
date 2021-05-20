import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore'

import { FixedFileModel } from 'app/models/fixed-file.model';


@Injectable({
  providedIn: 'root',
})
export class FixedFilesService {

    filesCollection: AngularFirestoreCollection<FixedFileModel>;
    files: Observable<FixedFileModel[]>;
    fileDoc: AngularFirestoreDocument<FixedFileModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){}

    initializeFiles(repositoryId: string){
        const id = +repositoryId // to number

        this.files = this.store.collection('fixed-files', ref => ref.where('repository_id', '==', id))
            .snapshotChanges().pipe(map(changes => {
                return changes.map(item => {
                    const data = item.payload.doc.data();
                    return {
                        id: item.payload.doc.id,
                        hash_fix: data['hash_fix'],
                        hash_bic: data['hash_bic'],
                        is_valid: data['is_valid'],
                        filepath: data['filepath']
                    } as FixedFileModel
                })
            }))
    }

    getAll(): Observable<FixedFileModel[]>{
        return this.files;
    }

    patchIsValid(file: FixedFileModel): Observable<boolean>{
        file.is_valid = !file.is_valid
        this.fileDoc = this.store.doc(`fixed-files/${file.id}`);
        this.fileDoc.update(file);
        return of(true)
    }
}
