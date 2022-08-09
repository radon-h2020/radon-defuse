import { Route } from '@angular/router';
import { CanDeactivateModelManagerDetails } from 'app/modules/admin/model-manager/model-manager.guards';
import { ModelManagerComponent } from 'app/modules/admin/model-manager/model-manager.component';
import { ModelManagerDetailsComponent } from 'app/modules/admin/model-manager/details/details.component';
import { ModelManagerListComponent } from 'app/modules/admin/model-manager/list/list.component';
import { ModelManagerFolderResolver, ModelManagerItemResolver, ModelManagerItemsResolver } from './model-manager.resolver';


export const modelManagerRoutes: Route[] = [
    {
        path     : '',
        component: ModelManagerComponent,
        children : [
            {
                path     : 'folders/:folderId',
                component: ModelManagerListComponent,
                resolve  : {
                    item: ModelManagerFolderResolver
                },
                children : [
                    {
                        path         : 'details/:id',
                        component    : ModelManagerDetailsComponent,
                        resolve      : {
                            item: ModelManagerItemResolver
                        },
                        canDeactivate: [CanDeactivateModelManagerDetails]
                    }
                ]
            },
            {
                path     : '',
                component: ModelManagerListComponent,
                resolve  : {
                    items: ModelManagerItemsResolver
                }
            }
        ]
    }
];