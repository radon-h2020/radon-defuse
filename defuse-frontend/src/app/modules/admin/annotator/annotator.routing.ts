import { Route } from '@angular/router';
import { CanDeactivateAnnotatorDetails } from 'app/modules/admin/annotator/annotator.guards';
import { AnnotatorResolver, CommitResolver, FixedFilesResolver, TagsResolver } from 'app/modules/admin/annotator/annotator.resolver';
import { AnnotatorComponent } from 'app/modules/admin/annotator/annotator.component';
import { AnnotatorDetailsComponent } from 'app/modules/admin/annotator/details/details.component';
import { RepositoriesResolver } from 'app/modules/admin/repositories/repositories.resolver';

export const annotatorRoutes: Route[] = [
    {

        path     : '',
        component: AnnotatorComponent,
        resolve  : {
            repositories : RepositoriesResolver,
            commits : AnnotatorResolver,
            fixedFiles: FixedFilesResolver,
            tags: TagsResolver,
        },
        children : [
            {
                path         : ':hash',
                component    : AnnotatorDetailsComponent,
                resolve      : {
                    commit  : CommitResolver,
                },
                canDeactivate: [CanDeactivateAnnotatorDetails]
            }
        ]
    }
];