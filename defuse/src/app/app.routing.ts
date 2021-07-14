import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';

import { RepositoryResolver } from 'app/resolvers/repository.resolver';

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
    },
    {
        path       : 'repository/:id/dashboard',
        component  : LayoutComponent,
        resolve: { repository: RepositoryResolver },
        loadChildren: () => import('app/modules/dashboard/dashboard.module').then(m => m.DashboardModule),
        data: {
            layout: 'centered'
        }
    },
    {
        path       : 'repository/:id/models',
        component  : LayoutComponent,
        loadChildren: () => import('app/modules/model-manager/model-manager.module').then(m => m.ModelManagerModule),
        data: {
            layout: 'centered'
        }
    },
    {
        path       : 'repository/:id/tasks',
        component  : LayoutComponent,
        loadChildren: () => import('app/modules/task-list/task-list.module').then(m => m.TaskListModule),
        data: {
            layout: 'centered'
        }
    },
];

