import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AnnotatorDetailsComponent } from 'app/modules/admin/annotator/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateAnnotatorDetails implements CanDeactivate<AnnotatorDetailsComponent>
{
    canDeactivate(
        component: AnnotatorDetailsComponent,
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

        // If the next state doesn't contain '/annotator'
        // it means we are navigating away from the
        // contacts app
        if ( !nextState.url.includes('/annotator') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another repository...
        if ( nextRoute.paramMap.get('hash') )
        {
            // Just navigate
            return true;
        }
        // Otherwise...
        else
        {
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}