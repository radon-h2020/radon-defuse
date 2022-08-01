import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { RepositoriesService } from 'app/modules/admin/repositories/repositories.service';
import { Repository } from 'app/modules/admin/repositories/repositories.types';

@Injectable({
    providedIn: 'root'
})
export class RepositoriesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _repositoriesService: RepositoriesService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Repository[]>
    {
        return this._repositoriesService.getRepositories();
    }
}


@Injectable({
    providedIn: 'root'
})
export class RepositoryResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _repositoriesService: RepositoriesService,
        private _router: Router
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Repository>
    {
        return this._repositoriesService.getRepository(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested repository is not available
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