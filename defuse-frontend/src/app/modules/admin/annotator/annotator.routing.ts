import { Route } from '@angular/router';
import { CanDeactivateAnnotatorDetails } from 'app/modules/admin/annotator/annotator.guards';
import { AnnotatorComponent } from 'app/modules/admin/annotator/annotator.component';
import { AnnotatorDetailsComponent } from 'app/modules/admin/annotator/details/details.component';

export const annotatorRoutes: Route[] = [
    {

        path     : '',
        component: AnnotatorComponent,
        children : [
            {
                path         : ':hash',
                component    : AnnotatorDetailsComponent,
                canDeactivate: [CanDeactivateAnnotatorDetails]
            }
        ]
    }
];