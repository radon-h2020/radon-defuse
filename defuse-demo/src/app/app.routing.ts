import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { RepositoriesListComponent } from 'app/repositories-list/repositories-list.component';

// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    // Landing routes
    {
        path: '',
        component  : LayoutComponent,
        loadChildren: () => import('app/welcome/welcome.module').then(m => m.LandingWelcomeModule),
        data: {
            layout: 'empty'
        }
    },

    {
        path: 'repositories',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        loadChildren: () => import('app/repositories-list/repositories-list.module').then(m => m.RepositoriesListModule),
    }
];

