import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'

import { DialogAddRepositoryComponent } from './../dialog-add-repository/dialog-add-repository.component';
import { RepositoryModel } from 'app/core/repository/repository.model'
import { RepositoriesService } from 'app/core/repository/repositories.service'

import { AngularFirestore } from '@angular/fire/firestore'

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RepositoriesListComponent implements OnInit {


    repositories: RepositoryModel[] = []
    filteredRepositoriesGithub: RepositoryModel[] = []
    filteredRepositoriesGitlab: RepositoryModel[] = []

    constructor(private repositoriesService: RepositoriesService, public dialog: MatDialog) {

        // Initialize list of repositories
        this.repositoriesService.getAll().subscribe(repositories => {
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

    onDeleteButtonClick(){
        console.log('Click on delete button')
    }

    onAdd(url: string, token: string){
        this.repositoriesService.addRepository(url, token)
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
        this.repositoriesService.deleteRepository(id)
            .subscribe(deleted => {
                console.log(deleted)
                // Notify user with notification or snackbar
            });

    }

    openDialog(){
        let dialogRef = this.dialog.open(DialogAddRepositoryComponent);
        dialogRef.afterClosed().subscribe(result => {
            if(result.url != undefined){
                this.onAdd(result.url, result.token)
            }
        })
    }

    trackRepositoryById(index: number, repo: RepositoryModel): number { return repo.id; }
}
