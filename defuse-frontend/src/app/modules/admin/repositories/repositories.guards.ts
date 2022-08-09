import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryDetailsComponent } from 'app/modules/admin/repositories/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateRepositoryDetails implements CanDeactivate<RepositoryDetailsComponent>
{
    canDeactivate(
        component: RepositoryDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )
        {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/repositories'
        // it means we are navigating away from the
        // contacts app
        if ( !nextState.url.includes('/repositories') ) {
            // Let it navigate
            return true;
        }

        // If we are navigating to another repository...
        if ( nextRoute.paramMap.get('id') ) {
            // Just navigate
            return true;
        } else {
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}