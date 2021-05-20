import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Commit } from 'app/core/repository/commit.model';
import { FixedFile } from 'app/core/repository/fixedfile.model';

const COMMIT_DATA: Commit[] = [
    {valid: true, hash: 'assa2343', msg: 'A very long message. This commit fixes issues #1 and #2 by replacing the classes X and Y to fix bug in synchronization.', defects: ['service', 'configuration data', 'security', 'dependency']},
    {valid: false, hash: 'dfd3432s', msg: 'A message', defects: ['service', 'configuration data']},
    {valid: false, hash: 'sasad123', msg: 'A message', defects: ['type1', 'idempotency']},
    {valid: true, hash: 'sasad123', msg: 'A message', defects: ['type1', 'type3']},
    {valid: true, hash: 'sasad123', msg: 'A message', defects: ['type1', 'type4']},
    {valid: true, hash: 'sasad123', msg: 'A message', defects: ['type1', 'type2']},
    {valid: false, hash: 'sasad123', msg: 'A message', defects: ['type1', 'type2']},
    {valid: false, hash: 'sasad123', msg: 'A message', defects: ['type1', 'type2']},
    {valid: false, hash: 'sasad123', msg: 'A message', defects: ['type1', 'type2']}
] // To remove when using REST APIs


const FILE_DATA: FixedFile[] = [
  {valid: true, hash_fix: 'assa2343', hash_bic: 'as12312321', path: 'filepath1.yaml'},
  {valid: true, hash_fix: 'assa2343', hash_bic: '124435435', path: 'filepath2.yaml'},
  {valid: true, hash_fix: 'dfd3432s', hash_bic: '536546546', path: 'filepath1.yaml'},
  {valid: true, hash_fix: 'sasad123', hash_bic: 'dgdffgd32', path: 'filepath3.yaml'},
  {valid: true, hash_fix: 'sasad123', hash_bic: 'sadsadsaas', path: 'filepath1.yaml'},
  {valid: true, hash_fix: 'sasad123', hash_bic: '124435435', path: 'filepath4.yaml'},
] // To remove when using REST APIs


@Injectable({
  providedIn: 'root',
})
export class RepositoryService {

  constructor(private httpClient: HttpClient){ }
  
  getFixingCommits(): Observable<Commit[]> {
    const commits = of(COMMIT_DATA); // of(commits) returns an Observable<Commit[]> that emits a single value, the array of mock heroes. It simulates a HttpCall
    return commits;

    //return this.httpClient.get<Commit[]>('url/to/api/fixing-commits')
  }

  patchFixingCommit(hash: string): Observable<boolean> {
    
    const response = of(Math.random() >= 0.5); // of(commits) returns an Observable<Commit[]> that emits a single value, the array of mock heroes. It simulates a HttpCall
    return response

    //return this.httpClient.patch("api/to/fixingcommit/hash")
  }

  getFixedFiles(): Observable<FixedFile[]> {
    const commits = of(FILE_DATA); // of(commits) returns an Observable<Commit[]> that emits a single value, the array of mock heroes. It simulates a HttpCall
    return commits;

    //return this.httpClient.get<FixedFile[]>('url/to/api/fixed-files')
  }

  patchFixedFile(file: FixedFile): Observable<boolean> {
    
    const response = of(Math.random() >= 0.5); // of(commits) returns an Observable<Commit[]> that emits a single value, the array of mock heroes. It simulates a HttpCall
    return response

    //return this.httpClient.patch("api/to/fixingcommit/hash")
  }

}
