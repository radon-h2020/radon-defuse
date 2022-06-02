import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { DialogAddRepositoryComponent } from './dialog-add-repository/dialog-add-repository.component';
import { DialogCollectRepositoriesComponent } from './dialog-collect-repositories/dialog-collect-repositories.component';
import { DialogDeleteRepositoryComponent } from './dialog-delete-repository/dialog-delete-repository.component';
import { RepositoryModel } from 'app/models/repository.model'
import { RepositoryListService } from 'app/services/repository-list.service'
import { TasksService } from 'app/services/tasks.service'

import { AngularFirestore } from '@angular/fire/firestore'

@Component({
  selector: 'app-repository-list',
  templateUrl: './repository-list.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RepositoryListComponent implements OnInit {

    repositories: RepositoryModel[] = []

    // Github
    dataSourceGithub: MatTableDataSource<RepositoryModel>;
    filteredRepositoriesGithub: RepositoryModel[] = []
    @ViewChild('PaginatorGithub') paginatorGithub: MatPaginator;

    // Gitlab
    dataSourceGitlab: MatTableDataSource<RepositoryModel>;
    filteredRepositoriesGitlab: RepositoryModel[] = []
    @ViewChild('PaginatorGitlab') paginatorGitlab: MatPaginator;

    // Common
    displayedColumns: string[] = ['repository'];
    isProgressBarHidden: boolean = true;

    constructor(private _cdr: ChangeDetectorRef,
                public _dialog: MatDialog,
                private _repositoryListService: RepositoryListService,
                private _tasksService: TasksService,
                private _snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.dataSourceGithub = new MatTableDataSource<RepositoryModel>(this.filteredRepositoriesGithub);
        this.dataSourceGitlab = new MatTableDataSource<RepositoryModel>(this.filteredRepositoriesGitlab);

        this._repositoryListService.getAll().subscribe(repositories => {
            this.repositories = repositories

            // Populate table Github
            this.filteredRepositoriesGithub = this.repositories.filter(item => item.url.includes('github.com'));
            this.dataSourceGithub = new MatTableDataSource<RepositoryModel>(this.filteredRepositoriesGithub);

            // Populate table Gitlab
            this.filteredRepositoriesGitlab = this.repositories.filter(item => item.url.includes('gitlab.com'));
            this.dataSourceGitlab = new MatTableDataSource<RepositoryModel>(this.filteredRepositoriesGitlab);

            this._cdr.detectChanges();
            this.dataSourceGithub.paginator = this.paginatorGithub;
            this.dataSourceGitlab.paginator = this.paginatorGitlab;
        });

        this._tasksService.getCrawlingTask().subscribe(tasks => {
            this.isProgressBarHidden = tasks.length == 0
        });
    }

    onAdd(url: string, token: string){

        if(url.startsWith('https')){
            this._repositoryListService.addRepository(url, token)
            .subscribe(added => {
                this._snackBar.open('Repository added!', 'Dismiss', {
                    duration: 5000,
                    panelClass: ['custom-success-snack-bar']
                });
            });
        }else{
            this._snackBar.open('Please insert a valid URL. For example https://github.com/radon-h2020/radon-defuse', 'Dismiss', {
                duration: 5000,
                panelClass: ['custom-warning-snack-bar']
            });
        }
    }

    onCollectRepositories(token: string, start: string, end: string, pushedAfter: string, language: string, minStars: number, minReleases: number){

        this._repositoryListService.collectRepositories(token, start, end, pushedAfter, language, minStars, minReleases)
            .subscribe(started => {
                this._snackBar.open('Repository collection started!', 'Dismiss', {
                    duration: 5000,
                    panelClass: ['custom-success-snack-bar']
            });
        });
    }

    /**
    Delete a repository
    @param id: repository id
    */
    onDelete(id){
        this._repositoryListService.delete(id)
            .subscribe(response => {
                if (response.status == 204){
                    this._snackBar.open('Repository deleted!', 'Dismiss', {
                        duration: 5000,
                        panelClass: ['custom-snack-bar']
                    });
                }
            });
    }

    onExportAsCsv(){
        const URL = `/api/repositories`;
        var hiddenElement = document.createElement('a');
        hiddenElement.href = URL;
        hiddenElement.target = '_blank';
        hiddenElement.download = `repositories.csv`;
        hiddenElement.click();
    }

    onScore(id: number){
        this._repositoryListService.score(id)
            .subscribe(response => {

                if (response.status == 200){
                    this._snackBar.open('Scoring started!', 'Dismiss', {duration: 5000, panelClass: ['custom-snack-bar']});
                }
            });
    }

    openAddDialog(){
        let dialogRef = this._dialog.open(DialogAddRepositoryComponent);
        dialogRef.afterClosed().subscribe(result => {
            if(result.url != undefined){
                this.onAdd(result.url, result.token)
            }
        })
    }

    openCollectRepositoriesDialog(){
        let dialogRef = this._dialog.open(DialogCollectRepositoriesComponent);
        dialogRef.afterClosed().subscribe(result => {
            if(result.start != undefined && result.end != undefined && result.language != undefined){
                this.onCollectRepositories(
                    result.token,
                    result.start,
                    result.end,
                    result.pushedAfter,
                    result.language,
                    result.minStars,
                    result.minReleases
                )
            }
        })
    }

    openDeleteDialog(id: number){

        const repoToDelete = this.repositories.filter(item => item.id == id)[0]

        let dialogRef = this._dialog.open(DialogDeleteRepositoryComponent, {data: {full_name: repoToDelete.full_name}});
        dialogRef.afterClosed().subscribe(confirmDelete => {
            if(confirmDelete){
                this.onDelete(repoToDelete.id)
            }
        })
    }

    onFilterGithub(filterValue: string) {
      this.dataSourceGithub.filter = filterValue.trim().toLowerCase();
    }

    onFilterGitlab(filterValue: string) {
      this.dataSourceGitlab.filter = filterValue.trim().toLowerCase();
    }

    trackRepositoryById(index: number, repo: RepositoryModel): number { return repo.id; }
}
