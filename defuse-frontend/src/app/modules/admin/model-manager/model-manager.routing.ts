import { Route } from '@angular/router';
// import { CanDeactivateFileManagerDetails } from 'app/modules/admin/apps/file-manager/file-manager.guards';
// import { ModelManagerDetailsComponent } from 'app/modules/admin/apps/model-manager/details/details.component';
import { ModelManagerComponent } from 'app/modules/admin/model-manager/model-manager.component';
import { ModelManagerListComponent } from 'app/modules/admin/model-manager/list/list.component';
import { ModelManagerFolderResolver, ModelManagerItemsResolver } from './model-manager.resolver';


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
                    // {
                    //     path         : 'details/:id',
                    //     component    : ModelManagerDetailsComponent,
                    //     resolve      : {
                    //         item: FileManagerItemResolver
                    //     },
                    //     canDeactivate: [CanDeactivateFileManagerDetails]
                    // }
                ]
            },
            {
                path     : '',
                component: ModelManagerListComponent,
                resolve  : {
                    items: ModelManagerItemsResolver
                },
                children : [
                    // {
                    //     path         : 'details/:id',
                    //     component    : FileManagerDetailsComponent,
                    //     resolve      : {
                    //         item: FileManagerItemResolver
                    //     },
                    //     canDeactivate: [CanDeactivateFileManagerDetails]
                    // }
                ]
            }
        ]
    }
];