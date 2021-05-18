import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators'
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore'
import { RepositoryModel } from 'app/models/repository.model';


@Injectable({
  providedIn: 'root',
})
export class RepositoryListService {

    repositoriesCollection: AngularFirestoreCollection<RepositoryModel>;
    repositories: Observable<RepositoryModel[]>;
    repositoryDoc: AngularFirestoreDocument<RepositoryModel>;

    constructor(private httpClient: HttpClient, private store: AngularFirestore){

        this.repositoriesCollection = this.store.collection('repositories', ref => ref.orderBy('full_name','asc'));
        this.repositories = this.repositoriesCollection.snapshotChanges().pipe(map(changes => {
            return changes.map(item => {
                const data = item.payload.doc.data() as RepositoryModel;

                const repo = {
                    id: +data.id,
                    url: data.url,
                    full_name: data.full_name,
                    default_branch: data.default_branch,
                    language: data.language
//                     size?: number;
                } as RepositoryModel

                return repo
            })
        }))
    }

    getAll(): Observable<RepositoryModel[]>{
        return this.repositories;
    }


    addRepository(url: string, token: string): Observable<boolean>{

        const regex = /(github|gitlab)\.com\/([\w\W]+)/
        const matches = regex.exec(url)
        if(matches){
            const host = matches[1]
            const fullName = matches[2]
            const API_URL = host == 'github' ?
                `https://api.github.com/repos/${fullName}` :
                `https://gitlab.com/api/v4/projects/${encodeURIComponent(fullName)}`

//             let headers = {}
//             if(token){
//             const key = host == 'github' ? 'Authorization' : 'PRIVATE-TOKEN'
//             const value = host == 'github' ? `token ${token}` : token
//             let headers = new HttpHeaders({key: value})
//             }

            return this.httpClient.get<any>(API_URL)
                       .pipe(
                            switchMap(response => {
                                const repo = {
                                    id: response['id'],
                                    full_name: `${fullName}`,
                                    url: url,
                                    default_branch: response['default_branch'],
                                    language: 'unknown'} as RepositoryModel

                                this.repositoriesCollection.doc(repo.id.toString()).set(repo)
                                return of(true)
                            })
                       );
        }else{
           return of(undefined);
        }
    }

    deleteRepository(id: number): Observable<boolean>{
        this.repositoryDoc = this.store.doc(`repositories/${id.toString()}`);
        this.repositoryDoc.delete();
        return of(true)
    }

}
