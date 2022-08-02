import { Route } from '@angular/router';
import { CanDeactivateAnnotatorDetails } from 'app/modules/admin/annotator/annotator.guards';
import { AnnotatorResolver, CommitResolver, FixedFilesResolver, TagsResolver } from 'app/modules/admin/annotator/annotator.resolver';
import { AnnotatorComponent } from 'app/modules/admin/annotator/annotator.component';
import { AnnotatorDetailsComponent } from 'app/modules/admin/annotator/details/details.component';

export const annotatorRoutes: Route[] = [
    {

        path     : '',
        component: AnnotatorComponent,
        resolve  : {
            // commits : AnnotatorResolver,
            // fixedFiles: FixedFilesResolver,
            // tags: TagsResolver,
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