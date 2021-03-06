import { AfterViewInit, Component, OnInit, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

// Dialog
import { DialogMineRepositoryComponent } from './dialogs/dialog-mine-repository.component';

// Models
import { CommitModel } from 'app/models/commit.model';
import { FixedFileModel } from 'app/models/fixed-file.model';
import { RepositoryModel } from 'app/models/repository.model';

// Services
import { CommitsService } from 'app/services/commits.service';
import { FixedFilesService } from 'app/services/fixed-files.service';
import { TasksService } from 'app/services/tasks.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {

    repository: RepositoryModel

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

    constructor(private _activatedRoute: ActivatedRoute,
                private _cdr: ChangeDetectorRef,
                private _commitsService: CommitsService,
                private _dialog: MatDialog,
                private _filesService: FixedFilesService,
                private _tasksService: TasksService,
                private _snackBar: MatSnackBar) {

    }

    ngOnInit(): void {

        this.repository = this._activatedRoute.snapshot.data["repository"];

        this.dataSourceCommits = new MatTableDataSource<CommitModel>(this.commits);
        this.dataSourceFiles = new MatTableDataSource<FixedFileModel>(this.files);

        this._commitsService.initializeCommits(this.repository.id)
        this._filesService.initializeFiles(this.repository.id)
        this._tasksService.initializeTasks(this.repository.id)

        this._commitsService.getAll().subscribe(commits => {
            this.commits = commits
            this.dataSourceCommits = new MatTableDataSource<CommitModel>(this.commits);
            this._cdr.detectChanges();
            this.dataSourceCommits.paginator = this.paginatorCommits;
        });

        this._filesService.getAll().subscribe(files => {
            this.files = files
            this.dataSourceFiles = new MatTableDataSource<FixedFileModel>(this.files);
            this._cdr.detectChanges();
            this.dataSourceFiles.paginator = this.paginatorFiles;
        });
    }

    patchCommit(commit: CommitModel) {
        this._commitsService.patchIsValid(commit)
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
        this._filesService.patchIsValid(file)
            .subscribe(patched => {
              if(!patched) console.log('TO SHOW ERROR THROUGH MESSAGE')
            });
    }

    onFilterCommits(filterValue: string) {
      this.dataSourceCommits.filter = filterValue.trim().toLowerCase();
    }

    onFilterFiles(filterValue: string) {
      this.dataSourceFiles.filter = filterValue.trim().toLowerCase();
    }

    onOpenMineDialog(){
        let dialogRef = this._dialog.open(DialogMineRepositoryComponent);
        dialogRef.afterClosed().subscribe(result => {
            if(result && result.language !== null){
                this.onMine(result.language)
            }
        })
    }

    onMine(language: string){
        this._tasksService.mine(language).subscribe(response => {

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


