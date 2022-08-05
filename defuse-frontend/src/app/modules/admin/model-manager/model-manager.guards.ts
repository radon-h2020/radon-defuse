import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ModelManagerDetailsComponent } from 'app/modules/admin/model-manager/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateModelManagerDetails implements CanDeactivate<ModelManagerDetailsComponent>
{
    canDeactivate(
        component: ModelManagerDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild ) {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/file-manager'
        // it means we are navigating away from the
        // file manager app
        if ( !nextState.url.includes('/model-manager') ){
            // Let it navigate
            return true;
        }

        // If we are navigating to another item...
        if ( nextState.url.includes('/details') ) {
            // Just navigate
            return true;
        } else {
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}