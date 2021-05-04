import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FixedFile } from './fixedfile.model';

const FILE_DATA: FixedFile[] = [
    {valid: true, hash_fix: 'assa2343', hash_bic: 'as12312321', path: 'filepath1.yaml'},
    {valid: true, hash_fix: 'assa2343', hash_bic: '124435435', path: 'filepath2.yaml'},
    {valid: true, hash_fix: 'dfd3432s', hash_bic: '536546546', path: 'filepath1.yaml'},
    {valid: true, hash_fix: 'sasad123', hash_bic: 'dgdffgd32', path: 'filepath3.yaml'},
] // To remove when using REST APIs

@Injectable({
  providedIn: 'root',
})
export class FixedFileService {

  constructor(private httpClient: HttpClient){ }

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
