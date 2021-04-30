import { Route } from '@angular/router';
import { LandingWelcomeComponent } from 'app/welcome/welcome.component';

export const landingWelcomeRoutes: Route[] = [
    {
        path     : '',
        component: LandingWelcomeComponent
    }
];
