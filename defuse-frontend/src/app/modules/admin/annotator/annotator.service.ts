import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Commit, FixedFile, Pagination } from 'app/modules/admin/annotator/annotator.types';

@Injectable({
    providedIn: 'root'
})
export class AnnotatorService
{
    // Private
    private _commit: BehaviorSubject<Commit | null> = new BehaviorSubject(null);
    private _commits: BehaviorSubject<Commit[] | null> = new BehaviorSubject(null);
    private _fixedFile: BehaviorSubject<FixedFile | null> = new BehaviorSubject(null);
    private _fixedFiles: BehaviorSubject<FixedFile[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<string[] | null> = new BehaviorSubject(null);

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
     * Getter for commit
     */
    get commit$(): Observable<Commit> {
        return this._commit.asObservable();
    }

    /**
     * Getter for commits
     */
    get commits$(): Observable<Commit[]> {
        return this._commits.asObservable();
    }

    /**
     * Getter for commit
     */
    get fixedFile$(): Observable<FixedFile> {
        return this._fixedFile.asObservable();
    }

    /**
     * Getter for commits
     */
    get fixedFiles$(): Observable<FixedFile[]> {
        return this._fixedFiles.asObservable();
    }

    
    /**
     * Getter for tags
     */
    get defects$(): Observable<string[]> {
        return this._tags.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<Pagination>
    {
        return this._pagination.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get commits
     */
    // getCommits(): Observable<Commit[]>
    // {
    //     return this._httpClient.get<Commit[]>('api/apps/commits/all').pipe(
    //         tap((commits) => {
    //             this._commits.next(commits);
    //         })
    //     );
    // }

    getCommits(page: number = 0, size: number = 10, query: string = ''): Observable<{ pagination: Pagination; commits: Commit[] }> {
        return this._httpClient.get<{ pagination: Pagination; commits: Commit[] }>('api/apps/commits/all', {
            params: {
                page: '' + page,
                size: '' + size,
                query
            }
        }).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._commits.next(response.commits);
            })
        );
    }
        
    /**
     * Filter commits of a given repository
     *
     * @param query
     */
    // filterCommits(repositoryId: number): Observable<Commit[]>
    // {
    //     return this._httpClient.get<Commit[]>('api/apps/commits/filter', {
    //         params: {repositoryId}
    //     }).pipe(
    //         tap((commits) => {
    //             this._commits.next(commits);
    //         })
    //     );
    // }
    
    /**
     * Search commits with given query
     *
     * @param query
     */
    searchCommits(query: string): Observable<Commit[]>
    {
        return this._httpClient.get<Commit[]>('api/apps/commits/search', {
            params: {query}
        }).pipe(
            tap((commits) => {
                this._commits.next(commits);
            })
        );
    }

    /**
     * Get commit by id
     */
    getCommitById(hash: string): Observable<Commit> {
        return this._commits.pipe(
            take(1),
            map((commits) => {

                // Find the commit
                const commit = commits.find(item => item.hash === hash) || null;

                // Update the commit
                this._commit.next(commit);

                // Return the commit
                return commit;
            }),
            switchMap((commit) => {

                if ( !commit )
                {
                    return throwError('Could not found commit with hash of ' + hash + '!');
                }

                return of(commit);
            })
        );
    }

    /**
     * Update commit
     *
     * @param id
     * @param commit
     */
    updateCommit(hash: string, commit: Commit): Observable<Commit>
    {
        commit.is_valid = !commit.is_valid

        return this.commits$.pipe(
            take(1),
            switchMap(commits => this._httpClient.patch<Commit>('api/apps/commits/commit', {
                hash,
                commit
            }).pipe(
                map((updatedCommit) => {

                    // Find the index of the updated commit
                    const index = commits.findIndex(item => item.hash === hash);

                    // Update the commit
                    commits[index] = updatedCommit;

                    // Update the commits
                    this._commits.next(commits);

                    // Return the updated commit
                    return updatedCommit;
                }),
                switchMap(updatedCommit => this.commit$.pipe(
                    take(1),
                    filter(item => item && item.hash === hash),
                    tap(() => {

                        // Update the commit if it's selected
                        this._commit.next(updatedCommit);

                        // Return the updated commit
                        return updatedCommit;
                    })
                ))
            ))
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Fixed Files
    // -----------------------------------------------------------------------------------------------------

    getFixedFiles(): Observable<FixedFile[]> {
        return this._httpClient.get<FixedFile[]>('api/apps/fixed-files/all').pipe(
            tap((fixedFiles) => {
                this._fixedFiles.next(fixedFiles);
            })
        );
    }

    getFixedFilesByCommit(hash: string): Observable<FixedFile[]> {
        return this._httpClient.get<FixedFile[]>('api/apps/fixed-files/commit', {
            params: {hash}
        }).pipe(
            tap((fixedFiles) => {
                this._fixedFiles.next(fixedFiles);
            })
        );
    }

    getFixedFileById(id: string): Observable<FixedFile> {
        return this._fixedFiles.pipe(
            take(1),
            map((fixedFiles) => {
                const fixedFile = fixedFiles.find(item => item.id === id) || null;
                this._fixedFiles.next(fixedFiles);
                return fixedFile;
            }),
            switchMap((fixedFile) => {

                if ( !fixedFile )
                {
                    return throwError('Could not found a fixed file with id ' + id + '!');
                }

                return of(fixedFile);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Tags
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tags
     */
    getTags(): Observable<string[]>{
        return this._httpClient.get<string[]>('api/apps/commits/tags').pipe(
            tap((tags) => {
                this._tags.next(tags);
            })
        );
    }
  
    /**
     * Create tag
     *
     * @param tag
     */
    createTag(tag: string): Observable<string>{
        return this.defects$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<string>('api/apps/commits/tag', {tag}).pipe(
                map((newTag) => {
                    
                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                })
            ))
        );
    }
  
    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(oldTag: string, newTag: string): Observable<string>{
        return this.defects$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<string>('api/apps/commits/tag', {
                oldTag,
                newTag
            }).pipe(
                map((updatedTag) => {

                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item === oldTag);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                })
            ))
        );
    }
  
    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(tag: string): Observable<boolean>
    {
        return this.defects$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/commits/tag', {params: {tag}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item === tag);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.commits$.pipe(
                    take(1),
                    map((commits) => {

                        // Iterate through the commits
                        commits.forEach((commit) => {

                            const tagIndex = commit.defects.findIndex(item => item === tag);

                            // If the commits has the tag, remove it
                            if ( tagIndex > -1 )
                            {
                                commit.defects.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
            ))
        );
    }
  
}