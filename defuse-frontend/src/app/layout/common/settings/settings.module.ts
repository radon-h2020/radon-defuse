import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { SettingsComponent } from 'app/layout/common/settings/settings.component';

@NgModule({
    declarations: [
        SettingsComponent
    ],
    imports     : [
        CommonModule,
        RouterModule,
        FuseDrawerModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ],
    exports     : [
        SettingsComponent
    ]
})
export class SettingsModule
{
}
