import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

import { Repository } from 'app/modules/admin/repositories/repositories.types';

@Injectable({
    providedIn: 'root'
})
export class RepositoriesService
{
    private repositoriesCollection: Observable<Repository[]>;
    private _repositories: BehaviorSubject<Repository[] | null> = new BehaviorSubject([]);

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
    get repositories$(): Observable<Repository[]> {
        return this._repositories.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getRepositories(): Observable<Repository[]> {
        return this.repositoriesCollection.pipe(
            tap((repos) => {
                this._repositories.next(repos);
            })
        );
    }

    /**
     * Get repository by id
     */
    getRepository(id: string): Observable<Repository> {
        return this.repositoriesCollection.pipe(
            map((repos) => {
                return repos.find(repo => repo.id === id) || null;
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



    /**
     * Create repository
     */
    // createRepository(): Observable<Repository>
    // {
    //     return this.repositories$.pipe(
    //         take(1),
    //         switchMap(repositories => this._httpClient.post<Repository>('api/apps/repositories/repository', {}).pipe(
    //             map((newRepository) => {

    //                 // Update the repositories with the new repository
    //                 this.repositories.next([newRepository, ...repositories]);

    //                 // Return the new repository
    //                 return newRepository;
    //             })
    //         ))
    //     );
    // }

    /**
     * Update repository
     *
     * @param id
     * @param repository
     */
    // updateRepository(id: number, repository: Repository): Observable<Repository>
    // {
    //     return this.repositories$.pipe(
    //         take(1),
    //         switchMap(repositories => this._httpClient.patch<Repository>('api/apps/repositories/repository', {
    //             id,
    //             repository
    //         }).pipe(
    //             map((updatedRepository) => {

    //                 // Find the index of the updated repository
    //                 const index = repositories.findIndex(item => item.id === id);

    //                 // Update the repository
    //                 repositories[index] = updatedRepository;

    //                 // Update the repositories
    //                 this._repositories.next(repositories);

    //                 // Return the updated repository
    //                 return updatedRepository;
    //             }),
    //             switchMap(updatedRepository => this.repository$.pipe(
    //                 take(1),
    //                 filter(item => item && item.id === id),
    //                 tap(() => {

    //                     // Update the repository if it's selected
    //                     this._repository.next(updatedRepository);

    //                     // Return the updated repository
    //                     return updatedRepository;
    //                 })
    //             ))
    //         ))
    //     );
    // }

    /**
     * Delete the repository
     *
     * @param id
     */
    // deleteRepository(id: number): Observable<boolean>
    // {
    //     return this.repositories$.pipe(
    //         take(1),
    //         switchMap(repositories => this._httpClient.delete('api/apps/repositories/repository', {params: {id}}).pipe(
    //             map((isDeleted: boolean) => {

    //                 // Find the index of the deleted repository
    //                 const index = repositories.findIndex(item => item.id === id);

    //                 // Delete the repository
    //                 repositories.splice(index, 1);

    //                 // Update the repositories
    //                 this._repositories.next(repositories);

    //                 // Return the deleted status
    //                 return isDeleted;
    //             })
    //         ))
    //     );
    // }
}