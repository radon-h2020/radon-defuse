import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

import { Repository, RepositoryPagination } from 'app/modules/admin/repositories/repositories.types';

@Injectable({
    providedIn: 'root'
})
export class RepositoriesService
{
    private repositoriesCollection: Observable<Repository[]>;

    private _pagination: BehaviorSubject<RepositoryPagination | null> = new BehaviorSubject({ length: 0, size: 10, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 } as RepositoryPagination);
    private _repositories: BehaviorSubject<Repository[] | null> = new BehaviorSubject([]);
    private _repository: BehaviorSubject<Repository | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _firestore: AngularFirestore) {
        this.repositoriesCollection = _firestore.collection('repositories', ref => ref.orderBy('full_name','asc')).snapshotChanges().pipe(map(changes => {
            return changes.map(item => {
                const data = item.payload.doc.data() as Repository;

                const repo = {
                    id: data.id,
                    url: data.url,
                    full_name: data.full_name,
                    default_branch: data.default_branch,
                    // comments_ratio: data["comments_ratio"],
                    // commit_frequency: data["commit_frequency"],
                    // core_contributors: data["core_contributors"],
                    // has_ci: data["has_ci"],
                    // has_license: data["has_license"],
                    // iac_ratio: data["iac_ratio"],
                    // size: data["repository_size"],
                } as Repository

                return repo
            })
        }))
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get pagination$(): Observable<RepositoryPagination> {
        return this._pagination.asObservable();
    }

    get repositories$(): Observable<Repository[]> {
        return this._repositories.asObservable();
    }

    get repository$(): Observable<Repository> {
        return this._repository.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getRepositoriesPage(pageIndex: number = 0, pageSize: number=10): Observable<RepositoryPagination> {
        return this.repositoriesCollection.pipe(
            map((repos) => {
                
                // Sort by alphabetic order, case insensitive
                repos.sort((a, b) => a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase()));

                // Calculate pagination details
                const begin = pageIndex * pageSize;
                const end = Math.min((pageSize * (pageIndex + 1)), repos.length);
                const lastPage = Math.max(Math.ceil(repos.length / pageSize), 1);
                
                // Paginate the results by size
                this._repositories.next(repos.slice(begin, end));
    
                const pagination = {
                    length    : repos.length,
                    size      : pageSize,
                    page      : pageIndex,
                    lastPage  : lastPage,
                    startIndex: begin,
                    endIndex  : end - 1
                } as RepositoryPagination
    
    
                this._pagination.next(pagination);
    
                return pagination
            })
        );      
    }

    /**
     * Get repository by id
     */
    getRepository(id: string): Observable<Repository> {
        return this._repositories.pipe(
            take(1),
            map((repos) => {
                // Find the contact
                const repo = repos.find(repo => repo.id === id) || null;
                this._repository.next(repo);
                return repo
            }),
            switchMap((repo) => {

                if ( !repo ) {
                    return this._firestore.collection('repositories', ref => ref.where('id', '==', id)).get().pipe(map(snapshot => {
                        const repo = snapshot.docs[0].data() as Repository
                        this._repository.next(repo)
                        return repo
                    }))
                }

                return of(repo);
            })
        )
    }

    searchRepositories(query: string): Observable<Repository[]>{
        return this.repositoriesCollection.pipe(
            tap((repos) => {
                const filteredRepos = repos.filter(repo => repo.full_name.toLowerCase().includes(query?.toLowerCase())); 
                this._repositories.next(filteredRepos);
            })
        )
    }

    createRepository(url: string, token?: string): Observable<Repository>{
        let api_url = `/backend-api/repository?url=${url}`;
        if(token) api_url += `&token=${token}`;
        return this._httpClient.post<any>(api_url, {observe:'response'})
    }

    deleteRepository(id: string): Observable<any>{
        const URL = `/backend-api/repository?id=${id}`;
        return this._httpClient.delete<any>(URL, {observe:'response'});
    }
}