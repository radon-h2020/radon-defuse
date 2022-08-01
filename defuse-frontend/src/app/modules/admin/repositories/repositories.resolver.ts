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
