import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Commit, FixedFile, CommitsPagination, Defect } from 'app/modules/admin/annotator/annotator.types';

@Injectable({
    providedIn: 'root'
})
export class CommitsService {

    // Private
    private _commitsCollection: Observable<Commit[]>;

    private _commit: BehaviorSubject<Commit | null> = new BehaviorSubject(null);
    private _commits: BehaviorSubject<Commit[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<CommitsPagination | null> = new BehaviorSubject({ length: 0, size: 10, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 } as CommitsPagination);


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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getCommitsPage(pageIndex: number = 0, pageSize: number=10): Observable<any> {
        return this._commitsCollection.pipe(
            map((commits) => {
               
                commits = commits.sort((a, b) => a.hash.localeCompare(b.hash))

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

    searchCommits(query: string): Observable<Commit[]> {
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

    toggleCommitValidity(commit: Commit): Observable<boolean> {
        commit.is_valid = !commit.is_valid
        const commitDoc = this._firestore.doc(`commits/${commit.hash}`);
        commitDoc.update(commit);
        return of(true)
    }

    addDefectToCommit(commit: Commit, defect: Defect): Observable<boolean> {
        if (!commit.defects.includes(defect.title)){
            commit.defects.unshift(defect.title);
            this._firestore.doc(`commits/${commit.hash}`).update(commit);
            return of(true)
        } 

        return of(true)
    }

    removeDefectFromCommit(commit: Commit, defect: Defect): Observable<boolean> {
        if (commit.defects.includes(defect.title)){
            commit.defects.splice(commit.defects.findIndex(item => item === defect.title), 1);
            this._firestore.doc(`commits/${commit.hash}`).update(commit);
        } 

        return of(true)
    }

}


@Injectable({
    providedIn: 'root'
})
export class DefectsService {

    // Private
    private _defectsCollection: Observable<Defect[]>;
    
    private _defect: BehaviorSubject<Defect | null> = new BehaviorSubject(null);
    private _defects: BehaviorSubject<Defect[] | null> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(private _firestore: AngularFirestore) {
        this._defectsCollection = this._firestore.collection('defects').snapshotChanges().pipe(map(changes => {
            return changes.map(item => { 
                let defect = item.payload.doc.data() as Defect;
                defect.id = item.payload.doc.id;
                return defect 
            })
        }))
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get defect$(): Observable<Defect> {
        return this._defect.asObservable();
    }

    get defects$(): Observable<Defect[]> {
        return this._defects.asObservable();
    }

    getDefects(): Observable<Defect[]> {
        return this._defectsCollection.pipe(
            map((defects) => {
                defects = defects.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
                this._defects.next(defects);
                return defects
            })
        );    
    }
  
    createDefect(title: string): Observable<Defect> {
        let newDefect = { title: title } as Defect 
        this._firestore.collection('defects').add(newDefect)
        return of(newDefect)
    }

    searchDefects(query: string): Observable<Defect[]> {
        return this._defectsCollection.pipe(
            tap((defects) => {
                const filteredDefects = defects.filter(defect => defect.title.toLowerCase().includes(query?.toLowerCase())); 
                this._defects.next(filteredDefects);
            })
        )
    }

    deleteDefect(defect: Defect): void {
        this._firestore.doc(`defects/${defect.id}`).delete();
    }
}


@Injectable({
    providedIn: 'root'
})
export class FixedFilesService {

    // Private
    private _filesCollection: Observable<FixedFile[]>;
    
    private _fixedFile: BehaviorSubject<FixedFile | null> = new BehaviorSubject(null);
    private _fixedFiles: BehaviorSubject<FixedFile[] | null> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(private _firestore: AngularFirestore) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get fixedFile$(): Observable<FixedFile> {
        return this._fixedFile.asObservable();
    }

    get fixedFiles$(): Observable<FixedFile[]> {
        return this._fixedFiles.asObservable();
    }

    set commit(hash:string) {
        this._filesCollection = this._firestore.collection('fixed-files', ref => ref.where('hash_fix', '==', hash)).snapshotChanges().pipe(map(changes => {
            return changes.map(item => { return item.payload.doc.data() as FixedFile; })
        }))
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    getFixedFiles(): Observable<FixedFile[]> {
        return this._filesCollection.pipe(
            map((files) => {
               
                files = files.sort((a, b) => a.filepath.toLowerCase().localeCompare(b.filepath.toLowerCase()))

                this._fixedFiles.next(files);
    
                return files
            })
        );    
    }

    updateFixedFile(file: FixedFile): Observable<boolean> {
        file.is_valid = !file.is_valid
        this._firestore.doc(`fixed-files/${file.id}`).update(file);
        return of(true)
    }
}
