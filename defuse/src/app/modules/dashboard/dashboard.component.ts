import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

// Models
import { CommitModel } from 'app/models/commit.model';
import { FixedFileModel } from 'app/models/fixed-file.model';

// Services
import { CommitsService } from 'app/services/commits.service';
import { FixedFilesService } from 'app/services/fixed-files.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {

    repositoryId: string

    // Commits
    commits: CommitModel[] = [];
    dataSourceCommits: MatTableDataSource<CommitModel>;
    displayedColumnsTableCommits: string[] = ['hash', 'msg', 'defects'];
    @ViewChild('PaginatorCommits') paginatorCommits: MatPaginator;

    // Files
    files: FixedFileModel[] = [];
    dataSourceFiles: MatTableDataSource<FixedFileModel>;
    displayedColumnsTableFiles: string[] = ['hash_fix', 'hash_bic', 'path'];
    @ViewChild('PaginatorFiles') paginatorFiles: MatPaginator;

    constructor(private activatedRoute: ActivatedRoute,
                private commitsService: CommitsService,
                private filesService: FixedFilesService,
                private snackBar: MatSnackBar) {

        this.repositoryId = this.activatedRoute.snapshot.paramMap.get("id");
        this.commitsService.initializeCommits(this.repositoryId)
        this.filesService.initializeFiles(this.repositoryId)

        this.commitsService.getAll().subscribe(commits => {
            this.commits = commits
            this.dataSourceCommits = new MatTableDataSource<CommitModel>(this.commits);
        });

        this.filesService.getAll().subscribe(files => {
            this.files = files
            this.dataSourceFiles = new MatTableDataSource<FixedFileModel>(this.files);
        });
    }

    ngOnInit(): void {
        this.repositoryId = this.activatedRoute.snapshot.paramMap.get("id");
        this.dataSourceCommits = new MatTableDataSource<CommitModel>(this.commits);
        this.dataSourceFiles = new MatTableDataSource<FixedFileModel>(this.files);
    }

    ngAfterViewInit() {
      this.dataSourceCommits.paginator = this.paginatorCommits;
      this.dataSourceFiles.paginator = this.paginatorFiles;
    }

    patchCommit(commit: CommitModel) {
        this.commitsService.patchIsValid(commit)
            .subscribe(patched => {
              if(!patched) console.log('TO SHOW ERROR THROUGH MESSAGE')
            });
    }

    patchFile(file: FixedFileModel) {
        this.filesService.patchIsValid(file)
            .subscribe(patched => {
              if(!patched) console.log('TO SHOW ERROR THROUGH MESSAGE')
            });
    }

    searchCommits(filterValue: string) {
      this.dataSourceCommits.filter = filterValue.trim().toLowerCase();
    }

    searchFiles(filterValue: string) {
      this.dataSourceFiles.filter = filterValue.trim().toLowerCase();
    }

    startMining(){
        console.log('Call MiningService')
    }
}


