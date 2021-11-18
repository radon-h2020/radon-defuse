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
                    comments_ratio: data["comments_ratio"],
                    commit_frequency: data["commit_frequency"],
                    core_contributors: data["core_contributors"],
                    has_ci: data["has_ci"],
                    has_license: data["has_license"],
                    iac_ratio: data["iac_ratio"],
                    size: data["repository_size"],
                } as RepositoryModel

                return repo
            })
        }))
    }

    getAll(): Observable<RepositoryModel[]>{
        return this.repositories;
    }

    get(id: number): Observable<any>{
        return this.store.collection('repositories', ref => ref.where('id', '==', id)).get().pipe(map(snapshot => {
            const item = snapshot.docs[0]
            return item.data() as RepositoryModel
        }))
    }

    addRepository(url: string, token: string): Observable<any>{
        let api_url = `/api/repository?url=${url}`;
        if(token) api_url += `&token=${token}`;
        return this.httpClient.post<any>(api_url, {observe:'response'});
    }

    collectRepositories(token: string, start: string, end: string, pushedAfter: string, language: string, minStars: number, minReleases: number): Observable<any>{
        let api_url = '/api/repositories';
        return this.httpClient.post<any>(api_url, {
            token: token,
            start: start,
            end: end,
            pushed_after: pushedAfter,
            language: language,
            min_stars: minStars,
            min_releases: minReleases}, {observe:'response'});
    }

    delete(id: number): Observable<any>{
        const URL = `/api/repository?id=${id}`;
        return this.httpClient.delete<any>(URL, {observe:'response'});
    }

    score(id: number): Observable<any>{
        const URL = `/api/repository?id=${id}`;
        return this.httpClient.patch<any>(URL, {observe:'response'});
    }
}
