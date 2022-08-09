import { Route } from '@angular/router';
import { ModelManagerComponent } from 'app/modules/admin/model-manager/model-manager.component';
import { ModelManagerDetailsComponent } from 'app/modules/admin/model-manager/details/details.component';
import { ModelManagerListComponent } from 'app/modules/admin/model-manager/list/list.component';
import { ModelManagerFolderResolver, ModelManagerItemsResolver } from './model-manager.resolver';


export const modelManagerRoutes: Route[] = [
    {
        path     : '',
        component: ModelManagerComponent,
        children : [
            {
                path     : '',
                component: ModelManagerListComponent,
                resolve  : {
                    items: ModelManagerItemsResolver
                }
            },
            {
                path         : 'details/:id',
                component    : ModelManagerDetailsComponent,
            },
            {
                path     : 'folders/:folderId',
                component: ModelManagerListComponent,
                resolve  : {
                    item: ModelManagerFolderResolver
                }
            },
        ]
    }
];