import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingWelcomeComponent } from './welcome.component';
import { FaqsComponent } from './faqs.component';
import { landingWelcomeRoutes } from './welcome.routing';

import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
    declarations: [
        LandingWelcomeComponent,
        FaqsComponent
    ],
    imports     : [
        RouterModule.forChild(landingWelcomeRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatExpansionModule
    ]
})
export class LandingWelcomeModule
{
}
