import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationItem, FuseNavigationService } from '@fuse/components/navigation';

import { RepositoryModel } from 'app/models/repository.model';
import { RepositoryListService } from 'app/services/repository-list.service';

export let horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        icon : 'heroicons_outline:home',
        link : '/dashboard'
    },
    {
        id   : 'models',
        title: 'Models',
        type : 'basic',
        icon : 'heroicons_outline:beaker',
        link : '/models'
    },
    {
        id   : 'tasks',
        title: 'Tasks',
        type : 'basic',
        icon : 'heroicons_outline:check-circle',
        link : '/tasks'
    }
];


@Component({
    selector     : 'centered-layout',
    templateUrl  : './centered.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CenteredLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    navigation: FuseNavigationItem[] = horizontalNavigation

    /**
     * Constructors
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService){
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        const id = this._activatedRoute.snapshot.paramMap.get("id");
        this.navigation[0].link = '/repository/' + id + '/dashboard'
        this.navigation[1].link = '/repository/' + id + '/models'
        this.navigation[2].link = '/repository/' + id + '/tasks'

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
