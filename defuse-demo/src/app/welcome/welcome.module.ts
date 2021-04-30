import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingWelcomeComponent } from 'app/welcome/welcome.component';
import { landingWelcomeRoutes } from 'app/welcome/welcome.routing';

@NgModule({
    declarations: [
        LandingWelcomeComponent
    ],
    imports     : [
        RouterModule.forChild(landingWelcomeRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule
    ]
})
export class LandingWelcomeModule
{
}
