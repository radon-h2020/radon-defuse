import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'

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
    filteredRepositoriesGithub: RepositoryModel[] = []
    filteredRepositoriesGitlab: RepositoryModel[] = []

    constructor(private repositoryListService: RepositoryListService, public dialog: MatDialog) {

        // Initialize list of repositories
        this.repositoryListService.getAll().subscribe(repositories => {
            this.repositories = repositories
            this.filteredRepositoriesGithub = this.repositories.filter(item => item.url.includes('github.com'));
            this.filteredRepositoriesGitlab = this.repositories.filter(item => item.url.includes('gitlab.com'));
        });
    }

    ngOnInit(): void {
    }

    filterRepository(value){
//         if(!value){
//           this.assignCopy();
//         } // when nothing has typed
//         this.filteredRepositoriesGithub = Object.assign([], this.repositoriesGithub).filter(
//          item => item.full_name.toLowerCase().indexOf(value.toLowerCase()) > -1
//         )
//         this.filteredRepositoriesGitlab = Object.assign([], this.repositoriesGitlab).filter(
//          item => item.full_name.toLowerCase().indexOf(value.toLowerCase()) > -1
//         )
    }

    onAdd(url: string, token: string){
        this.repositoryListService.addRepository(url, token)
            .subscribe(added => {
                console.log(added)
                // Notify user with notification or snackbar
            });
    }

    /**
    Remove a repository
    @param id: repository id
    */
    onDelete(id){
        this.repositoryListService.deleteRepository(id)
            .subscribe(deleted => {
                console.log(deleted)
                // Notify user with notification or snackbar
            });

    }

    openAddDialog(){
        let dialogRef = this.dialog.open(DialogAddRepositoryComponent);
        dialogRef.afterClosed().subscribe(result => {
            if(result.url != undefined){
                this.onAdd(result.url, result.token)
            }
        })
    }

    openDeleteDialog(id: number){

        const repoToDelete = this.repositories.filter(item => item.id == id)[0]

        let dialogRef = this.dialog.open(DialogDeleteRepositoryComponent, {data: {full_name: repoToDelete.full_name}});
        dialogRef.afterClosed().subscribe(confirmDelete => {
            if(confirmDelete){
                this.onDelete(repoToDelete.id)
            }
        })
    }

    trackRepositoryById(index: number, repo: RepositoryModel): number { return repo.id; }
}
