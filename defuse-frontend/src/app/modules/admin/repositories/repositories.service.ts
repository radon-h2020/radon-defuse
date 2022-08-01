import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Repository } from 'app/modules/admin/repositories/repositories.types';

@Injectable({
    providedIn: 'root'
})
export class RepositoriesService
{
    // Private
    private _repository: BehaviorSubject<Repository | null> = new BehaviorSubject(null);
    private _repositories: BehaviorSubject<Repository[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for repository
     */
    get repository$(): Observable<Repository>
    {
        return this._repository.asObservable();
    }

    /**
     * Getter for repositories
     */
    get repositories$(): Observable<Repository[]>
    {
        return this._repositories.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get repositories
     */
    getRepositories(): Observable<Repository[]>
    {
        return this._httpClient.get<Repository[]>('api/apps/repositories/all').pipe(
            tap((repositories) => {
                this._repositories.next(repositories);
            })
        );
    }

    /**
     * Search repositories with given query
     *
     * @param query
     */
    searchRepositories(query: string): Observable<Repository[]>
    {
        return this._httpClient.get<Repository[]>('api/apps/repositories/search', {
            params: {query}
        }).pipe(
            tap((repositories) => {
                this._repositories.next(repositories);
            })
        );
    }

    /**
     * Get repository by id
     */
    getRepositoryById(id: number): Observable<Repository>
    {
        return this._repositories.pipe(
            take(1),
            map((repositories) => {

                // Find the repository
                const repository = repositories.find(item => item.id === id) || null;

                // Update the repository
                this._repository.next(repository);

                // Return the repository
                return repository;
            }),
            switchMap((repository) => {

                if ( !repository )
                {
                    return throwError('Could not found repository with id of ' + id + '!');
                }

                return of(repository);
            })
        );
    }

    /**
     * Create repository
     */
    createRepository(): Observable<Repository>
    {
        return this.repositories$.pipe(
            take(1),
            switchMap(repositories => this._httpClient.post<Repository>('api/apps/repositories/repository', {}).pipe(
                map((newRepository) => {

                    // Update the repositories with the new repository
                    this._repositories.next([newRepository, ...repositories]);

                    // Return the new repository
                    return newRepository;
                })
            ))
        );
    }

    /**
     * Update repository
     *
     * @param id
     * @param repository
     */
    updateRepository(id: number, repository: Repository): Observable<Repository>
    {
        return this.repositories$.pipe(
            take(1),
            switchMap(repositories => this._httpClient.patch<Repository>('api/apps/repositories/repository', {
                id,
                repository
            }).pipe(
                map((updatedRepository) => {

                    // Find the index of the updated repository
                    const index = repositories.findIndex(item => item.id === id);

                    // Update the repository
                    repositories[index] = updatedRepository;

                    // Update the repositories
                    this._repositories.next(repositories);

                    // Return the updated repository
                    return updatedRepository;
                }),
                switchMap(updatedRepository => this.repository$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the repository if it's selected
                        this._repository.next(updatedRepository);

                        // Return the updated repository
                        return updatedRepository;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the repository
     *
     * @param id
     */
    deleteRepository(id: number): Observable<boolean>
    {
        return this.repositories$.pipe(
            take(1),
            switchMap(repositories => this._httpClient.delete('api/apps/repositories/repository', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted repository
                    const index = repositories.findIndex(item => item.id === id);

                    // Delete the repository
                    repositories.splice(index, 1);

                    // Update the repositories
                    this._repositories.next(repositories);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
}