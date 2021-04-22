import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

import { Commit } from 'app/core/repository/commit.model';
import { RepositoryService } from 'app/core/repository/repository.service';
import { FixedFile } from 'app/core/repository/fixedfile.model';


import {MatSnackBar} from '@angular/material/snack-bar';

/**
 * @title Table with pagination
 */
@Component({
  selector     : 'repository',
  templateUrl  : './repository.component.html'
})
export class RepositoryComponent implements AfterViewInit, OnInit {

    // Commits
    commits: Commit[] = [];
    dataSourceCommits: MatTableDataSource<Commit>;
    displayedColumnsTableCommits: string[] = ['hash', 'msg', 'defects'];
    @ViewChild('PaginatorCommits') paginatorCommits: MatPaginator;

    // Files
    files: FixedFile[] = [];
    dataSourceFiles: MatTableDataSource<FixedFile>;
    displayedColumnsTableFiles: string[] = ['hash_fix', 'hash_bic', 'path'];
    @ViewChild('PaginatorFiles') paginatorFiles: MatPaginator;

    constructor(private repositoryService: RepositoryService, private snackBar: MatSnackBar) {
    }

    ngAfterViewInit() {
      this.dataSourceCommits.paginator = this.paginatorCommits;
      this.dataSourceFiles.paginator = this.paginatorFiles;
    }

    ngOnInit() {
        this.getCommits();
        this.dataSourceCommits = new MatTableDataSource<Commit>(this.commits);

        this.getFiles();
        this.dataSourceFiles = new MatTableDataSource<FixedFile>(this.files);
    }
    
    applyFilterCommits(filterValue: string) {
      this.dataSourceCommits.filter = filterValue.trim().toLowerCase();
    }

    applyFilterFiles(filterValue: string) {
      this.dataSourceFiles.filter = filterValue.trim().toLowerCase();
    }

    getCommits(): void {
      this.repositoryService.getFixingCommits()
          .subscribe(commits => this.commits = commits);
    }

    getFiles(): void {
      this.repositoryService.getFixedFiles()
          .subscribe(files => this.files = files);
    }

    patchCommit(commit: Commit): void{

        this.repositoryService.patchFixingCommit(commit.hash)
            .subscribe(ok => {
              if(!ok){
                console.log('TO SHOW ERROR THROUGH MESSAGE')
              }else{
                let idx = this.commits.indexOf(commit)
                this.commits[idx].valid = !commit.valid
                //this.setFilesToShow()
                
                let indices = this.findFiles(this.commits[idx].hash)
                for(let idx of indices){
                  this.files[idx].valid = commit.valid
                }
              }
            });
    }

    patchFile(file: FixedFile): void{

        this.repositoryService.patchFixedFile(file)
            .subscribe(ok => {
              if(!ok){
                console.log('TO SHOW ERROR THROUGH MESSAGE')
              }else{
                let idx = this.files.indexOf(file)
                this.files[idx].valid = !file.valid
              }
            });
    }

    mine(): void{
      console.log('Here I start mining and notify the user that she will be notified asap')
      this.snackBar.open('Mining process started!', 'Dismiss', {
        duration: 4000,
        panelClass: ['custom-snackbar']
        //verticalPosition: 'bottom', // Allowed values are  'top' | 'bottom'
        //horizontalPosition: 'center', // Allowed values are 'start' | 'center' | 'end' | 'left' | 'right'
      });
    }

    private findFiles(hash: string){
      var indexes = [], i;
      for(i = 0; i < this.files.length; i++)
          if (this.files[i].hash_fix === hash)
              indexes.push(i);
      return indexes;
    }
}


