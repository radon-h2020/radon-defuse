import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, of, map, throwError } from 'rxjs';
import { Items } from 'app/modules/admin/model-manager/model-manager.types';
import { ModelManagerService } from 'app/modules/admin/model-manager/model-manager.service'

@Injectable({
    providedIn: 'root'
})
export class ModelManagerItemsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _modelManagerService: ModelManagerService,
        private _router: Router,)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Items>
    {
        return this._modelManagerService.getItems()
                    .pipe(
                        map((items) => { 
                            return items
                        }),
                        catchError((error) => {
                            // Log the error
                            console.error(error);

                            return of( { folders: [], files: [] } as Items);
                        })
                    )
    }
}

@Injectable({
    providedIn: 'root'
})
export class ModelManagerFolderResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _modelManagerService: ModelManagerService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Items>
    {
        return this._modelManagerService.getItems(route.paramMap.get('folderId'))
                   .pipe(
                       // Error here means the requested task is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}