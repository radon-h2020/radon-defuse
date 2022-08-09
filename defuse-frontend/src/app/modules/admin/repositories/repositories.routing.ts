import { Route } from '@angular/router';
import { CanDeactivateRepositoryDetails } from 'app/modules/admin/repositories/repositories.guards';
import { RepositoriesComponent } from 'app/modules/admin/repositories/repositories.component';
import { RepositoryDetailsComponent } from 'app/modules/admin/repositories/details/details.component';

export const repositoriesRoutes: Route[] = [
    {

        path     : '',
        component: RepositoriesComponent,
        children : [
            {
                path         : ':id',
                component    : RepositoryDetailsComponent,
                canDeactivate: [CanDeactivateRepositoryDetails]
            }
        ]
    }
];