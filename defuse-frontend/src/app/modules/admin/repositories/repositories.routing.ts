import { Route } from '@angular/router';
import { CanDeactivateRepositoryDetails } from 'app/modules/admin/repositories/repositories.guards';
import { RepositoriesResolver, RepositoryResolver } from 'app/modules/admin/repositories/repositories.resolver';
import { RepositoriesComponent } from 'app/modules/admin/repositories/repositories.component';
import { RepositoryDetailsComponent } from 'app/modules/admin/repositories/details/details.component';

export const repositoriesRoutes: Route[] = [
    {

        path     : '',
        component: RepositoriesComponent,
        resolve  : {
            repositories : RepositoriesResolver,
        },
        children : [
            {
                path         : ':id',
                component    : RepositoryDetailsComponent,
                resolve      : {
                    repository  : RepositoryResolver,
                },
                canDeactivate: [CanDeactivateRepositoryDetails]
            }
        ]
    }
];