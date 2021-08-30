import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { DialogAddRepositoryComponent } from './dialog-add-repository/dialog-add-repository.component';
import { DialogDeleteRepositoryComponent } from './dialog-delete-repository/dialog-delete-repository.component';
import { RepositoryModel } from 'app/models/repository.model'
import { RepositoryListService } from 'app/services/repository-list.service'

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


    constructor(private _cdr: ChangeDetectorRef,
                public _dialog: MatDialog,
                private _repositoryListService: RepositoryListService,
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

    /**
    Delete a repository
    @param id: repository id
    */
    onDelete(id){
        this._repositoryListService.deleteRepository(id)
            .subscribe(deleted => {
                this._snackBar.open('Repository deleted!', 'Dismiss', {
                    duration: 5000,
                    panelClass: ['custom-snack-bar']
                });
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
