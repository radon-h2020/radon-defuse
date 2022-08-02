import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AnnotatorService } from 'app/modules/admin/annotator/annotator.service';
import { Commit, FixedFile, CommitsPagination } from 'app/modules/admin/annotator/annotator.types';

@Injectable({
    providedIn: 'root'
})
export class AnnotatorResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _annotatorService: AnnotatorService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: CommitsPagination; commits: Commit[] }>
    {
        return this._annotatorService.getCommitsPage('1');
    }
}


@Injectable({
    providedIn: 'root'
})
export class CommitResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _annotatorService: AnnotatorService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Commit>
    {
        return this._annotatorService.getCommit(route.paramMap.get('hash'))
                   .pipe(
                       // Error here means the requested commit is not available
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

@Injectable({
    providedIn: 'root'
})
export class FixedFilesResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _annotatorService: AnnotatorService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FixedFile[]>
    {
        return this._annotatorService.getFixedFiles();
    }
}

@Injectable({
    providedIn: 'root'
})
export class TagsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _annotatorService: AnnotatorService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string[]>
    {
        return this._annotatorService.getTags();
    }
}