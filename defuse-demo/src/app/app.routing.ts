import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    // Landing routes
    {
        path: '',
        component  : LayoutComponent,
        loadChildren: () => import('app/modules/welcome/welcome.module').then(m => m.LandingWelcomeModule),
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
        loadChildren: () => import('app/modules/repository-list/repository-list.module').then(m => m.RepositoryListModule),
    }
];

