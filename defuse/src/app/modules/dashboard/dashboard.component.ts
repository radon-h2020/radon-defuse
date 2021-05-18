import { AfterViewInit, Component, OnInit, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
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
import { TasksService } from 'app/services/tasks.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
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
    displayedColumnsTableFiles: string[] = ['hash_fix', 'hash_bic', 'filepath'];
    @ViewChild('PaginatorFiles') paginatorFiles: MatPaginator;

    constructor(private activatedRoute: ActivatedRoute,
                private cdr: ChangeDetectorRef,
                private commitsService: CommitsService,
                private filesService: FixedFilesService,
                private tasksService: TasksService,
                private _snackBar: MatSnackBar) {

        this.repositoryId = this.activatedRoute.snapshot.paramMap.get("id");
        this.commitsService.initializeCommits(this.repositoryId)
        this.filesService.initializeFiles(this.repositoryId)
        this.tasksService.initializeTasks(this.repositoryId)

        this.commitsService.getAll().subscribe(commits => {
            this.commits = commits
            this.dataSourceCommits = new MatTableDataSource<CommitModel>(this.commits);
            this.cdr.detectChanges();
            this.dataSourceCommits.paginator = this.paginatorCommits;
        });

        this.filesService.getAll().subscribe(files => {
            this.files = files
            this.dataSourceFiles = new MatTableDataSource<FixedFileModel>(this.files);
            this.cdr.detectChanges();
            this.dataSourceFiles.paginator = this.paginatorFiles;
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
                if(!patched) {
                    console.log('TO SHOW ERROR THROUGH MESSAGE')
                } else {

                    // Switch the validity of commit files accordingly
                    for(let file of this.files){
                        if(file.hash_fix === commit.hash){
                            this.patchFile(file)
                        }
                    }
                }
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
        this.tasksService.mine('ansible').subscribe(response => {

            let message = ''

            if(response.status === 202){
                message = 'Mining started...'
            }else{
                message = 'Some errors have occurred!'
            }

            this._snackBar.open(message, 'Dismiss', {
                duration: 5000,
                panelClass: ['custom-snack-bar']
            });
        })
    }
}


