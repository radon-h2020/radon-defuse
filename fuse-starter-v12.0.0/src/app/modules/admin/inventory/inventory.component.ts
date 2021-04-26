import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { InventoryService } from 'app/core/inventory/inventory.service';
import { Repository } from 'app/core/repository/repository.model';
import { speedDialFabAnimations } from 'app/shared/speed-dial-fab.animations';

import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';

/**
 * @title Table with pagination
 */
@Component({
  selector     : 'inventory',
  templateUrl  : './inventory.component.html',
  animations: speedDialFabAnimations
})
export class InventoryComponent implements OnInit {


    /**
     * FABs button
     */
    buttons = [];
    fabTogglerState = 'inactive';

    showItems() {
      this.fabTogglerState = 'active';
      this.buttons = [
        { icon: 'add', tooltip: 'Add repository', action: 'foo()' },
        { icon: 'library_add', tooltip: 'Collect repositories', action: 'bar()' },
        { icon: 'download', tooltip: 'Download to CSV', action: 'export2csv()'}];
    }

    hideItems() {
      this.fabTogglerState = 'inactive';
      this.buttons = [];
    }

    onToggleFab() {
      this.buttons.length ? this.hideItems() : this.showItems();
    }

    export2csv(){
        const csv = this.repositoriesGithub.map(item => { return Object.values(item).toString() }).join('\n')
        console.log(csv)
    }

    foo(){
        console.log('Clicked on Foo')
    }

    bar(){
    }
    /**
     * List
     */

    repositoriesGithub: Repository[]
    repositoriesGitlab: Repository[]
    filteredRepositoriesGithub: Repository[]
    filteredRepositoriesGitlab: Repository[]

    languages = [{ text: 'All', value: 'all'},
                 { text: 'Ansible', value: 'ansible'},
                 { text: 'Python', value: 'python'},
                 { text: 'Tosca', value: 'tosca'}]

    languageSelected: string = 'all'

    languageChanged(){
      if(this.languageSelected.toLowerCase() === 'all'){
          this.assignCopy();
      }else{
          this.filteredRepositoriesGithub = Object.assign([], this.repositoriesGithub).filter(
             item => item.language.toLowerCase().indexOf(this.languageSelected) > -1
          )
          this.filteredRepositoriesGitlab = Object.assign([], this.repositoriesGitlab).filter(
             item => item.language.toLowerCase().indexOf(this.languageSelected) > -1
          )
      }
    }

    filterItem(value){
      if(!value){
          this.assignCopy();
      } // when nothing has typed
      this.filteredRepositoriesGithub = Object.assign([], this.repositoriesGithub).filter(
         item => item.full_name.toLowerCase().indexOf(value.toLowerCase()) > -1
      )
      this.filteredRepositoriesGitlab = Object.assign([], this.repositoriesGitlab).filter(
         item => item.full_name.toLowerCase().indexOf(value.toLowerCase()) > -1
      )
    }

    assignCopy(){
      this.filteredRepositoriesGithub = Object.assign([], this.repositoriesGithub);
      this.filteredRepositoriesGitlab = Object.assign([], this.repositoriesGitlab);
    }


    constructor(
      private inventoryService: InventoryService) {
        this.repositoriesGithub = []
        this.repositoriesGitlab = []
        this.filteredRepositoriesGithub = []
        this.filteredRepositoriesGitlab = []
    }

    ngOnInit() {
      this.getRepositories();
      this.filteredRepositoriesGithub = this.repositoriesGithub
      this.filteredRepositoriesGitlab = this.repositoriesGitlab
    }

    getRepositories(){
      this.inventoryService.getRepositories()
          .subscribe(repositories => {
            for(let repo of repositories){
              if(repo.url.includes('github.com')){
                this.repositoriesGithub.push(repo)
              }else if(repo.url.includes('gitlab.com')){
                this.repositoriesGitlab.push(repo)
              }
            }
          });
    }
}


