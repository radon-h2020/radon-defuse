import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
export class InventoryComponent implements AfterViewInit, OnInit {


    /**
     * FABs button
     */
    buttons = [];
    fabTogglerState = 'inactive';

    showItems() {
      this.fabTogglerState = 'active';
      this.buttons = [{ icon: 'timeline', tooltip: 'Add repository' }, { icon: 'view_headline', tooltip: 'Collect repositories' }];
    }
  
    hideItems() {
      this.fabTogglerState = 'inactive';
      this.buttons = [];
    }
  
    onToggleFab() {
      this.buttons.length ? this.hideItems() : this.showItems();
    }

    /**
     * Sidenav
     */
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = false;

    /**
     * Table
     */
    displayedColumns: string[] = ['name'];

    repositoriesGithub: Repository[]
    repositoriesGitlab: Repository[]
    
    dataSourceGithub: MatTableDataSource<Repository>;
    dataSourceGitlab: MatTableDataSource<Repository>;

    @ViewChild('PaginatorGithub') paginatorGithub: MatPaginator;
    @ViewChild('PaginatorGitlab') paginatorGitlab: MatPaginator;

    constructor(
      private inventoryService: InventoryService) {
        this.repositoriesGithub = []
        this.repositoriesGitlab = []
    }

    ngAfterViewInit() {
      this.dataSourceGithub.paginator = this.paginatorGithub;
      this.dataSourceGitlab.paginator = this.paginatorGitlab;
    }

    ngOnInit() {
      this.getRepositories();
      this.dataSourceGithub = new MatTableDataSource<Repository>(this.repositoriesGithub);
      this.dataSourceGitlab = new MatTableDataSource<Repository>(this.repositoriesGitlab);
    }
    
    applyFilterRepositories(filterValue: string) {
      this.dataSourceGithub.filter = filterValue.trim().toLowerCase();
      this.dataSourceGitlab.filter = filterValue.trim().toLowerCase();
    }

    getRepositories(){
      //this.inventoryService.getRepositories()
      //    .subscribe(repositories => this.repositories = repositories);

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

      /*this.inventoryService.getRepositories()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((repositories: Repository[]) => {

                // Update the counts
                this.repositoriesCount = repositories.length;
                console.log(repositories.length)
                console.log(this.repositoriesCount)

                // Mark for check
                //this._changeDetectorRef.markForCheck();
            });
        */
    }
}


