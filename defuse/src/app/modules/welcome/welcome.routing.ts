import { Route } from '@angular/router';
import { LandingWelcomeComponent } from './welcome.component';
import { FaqsComponent } from './faqs.component';

export const landingWelcomeRoutes: Route[] = [
    {
        path     : '',
        component: LandingWelcomeComponent
    },
    {
        path     : 'faqs',
        component: FaqsComponent
    }
];
