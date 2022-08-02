import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Commit, FixedFile, CommitsPagination } from 'app/modules/admin/annotator/annotator.types';
import { repositories } from 'app/mock-api/apps/repositories/data';

@Injectable({
    providedIn: 'root'
})
export class CommitsService
{

    // Private
    private _commitsCollection: Observable<Commit[]>;


    private _commit: BehaviorSubject<Commit | null> = new BehaviorSubject(null);
    private _commits: BehaviorSubject<Commit[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<CommitsPagination | null> = new BehaviorSubject({ length: 0, size: 10, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 } as CommitsPagination);

    
    private _fixedFile: BehaviorSubject<FixedFile | null> = new BehaviorSubject(null);
    private _fixedFiles: BehaviorSubject<FixedFile[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<string[] | null> = new BehaviorSubject(null);



    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _firestore: AngularFirestore) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get commit$(): Observable<Commit> {
        return this._commit.asObservable();
    }

    get commits$(): Observable<Commit[]> {
        return this._commits.asObservable();
    }

    get pagination$(): Observable<CommitsPagination> {
        return this._pagination.asObservable();
    }

    set repositoryId(id:string) {
        this._commitsCollection = this._firestore.collection('commits', ref => ref.where('repository_id', '==', id)).snapshotChanges().pipe(map(changes => {
            return changes.map(item => { return item.payload.doc.data() as Commit; })
        }))
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getCommitsPage(repositoryId: string, pageIndex: number = 0, pageSize: number=10): Observable<any> {
        return this._commitsCollection.pipe(
            map((commits) => {
               
                commits = commits.filter(commit => commit.repository_id == repositoryId)
                                 .sort((a, b) => a.hash.localeCompare(b.hash))

                const length = commits.length

                // Calculate pagination details
                const begin = pageIndex * pageSize;
                const end = Math.min((pageSize * (pageIndex + 1)), length);
                const lastPage = Math.max(Math.ceil(length / pageSize), 1);
                
                // Paginate the results by size
                commits = commits.slice(begin, end);
                this._commits.next(commits);
    
                const pagination = {
                    length    : length,
                    size      : pageSize,
                    page      : pageIndex,
                    lastPage  : lastPage,
                    startIndex: begin,
                    endIndex  : end - 1
                } as CommitsPagination
    
    
                this._pagination.next(pagination);
    
                // return pagination
                return { commits, pagination }
            })
        );      
    }

    getCommit(hash: string): Observable<Commit> {
        return this._commits.pipe(
            take(1),
            map((commits) => {

                if ( !commits ){
                    return
                }

                // Find the contact
                const commit = commits.find(commit => commit.hash === hash) || null;
                this._commit.next(commit);
                return commit
            }),
            switchMap((commit) => {

                if ( !commit ) {
                    return this._firestore.collection('commits', ref => ref.where('hash', '==', hash)).get().pipe(map(snapshot => {
                        const commit = snapshot.docs[0].data() as Commit
                        this._commit.next(commit)
                        return commit
                    }))
                }

                return of(commit);
            })
        )
    }

    searchCommits(query: string): Observable<Commit[]>{
        return this._commitsCollection.pipe(
            tap((repos) => {
                const filteredRepos = repos.filter(repo => 
                    repo.hash.includes(query?.toLowerCase())
                    || repo.msg.includes(query?.toLowerCase())
                    || repo.defects.includes(query?.toLowerCase())
                ); 
                this._commits.next(filteredRepos);
            })
        )
    }

    toggleCommitValidity(commit: Commit): Observable<boolean>{
        commit.is_valid = !commit.is_valid
        const commitDoc = this._firestore.doc(`commits/${commit.hash}`);
        commitDoc.update(commit);
        return of(true)
    }

    /**
     * Update commit
     *
     * @param id
     * @param commit
     */
    // updateCommit(hash: string, commit: Commit): Observable<Commit>
    // {
    //     commit.is_valid = !commit.is_valid

    //     return this.commits$.pipe(
    //         take(1),
    //         switchMap(commits => this._httpClient.patch<Commit>('api/apps/commits/commit', {
    //             hash,
    //             commit
    //         }).pipe(
    //             map((updatedCommit) => {

    //                 // Find the index of the updated commit
    //                 const index = commits.findIndex(item => item.hash === hash);

    //                 // Update the commit
    //                 commits[index] = updatedCommit;

    //                 // Update the commits
    //                 this._commits.next(commits);

    //                 // Return the updated commit
    //                 return updatedCommit;
    //             }),
    //             switchMap(updatedCommit => this.commit$.pipe(
    //                 take(1),
    //                 filter(item => item && item.hash === hash),
    //                 tap(() => {

    //                     // Update the commit if it's selected
    //                     this._commit.next(updatedCommit);

    //                     // Return the updated commit
    //                     return updatedCommit;
    //                 })
    //             ))
    //         ))
    //     );
    // }

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