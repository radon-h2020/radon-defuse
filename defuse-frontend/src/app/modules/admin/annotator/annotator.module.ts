import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';

import { AnnotatorComponent } from 'app/modules/admin/annotator/annotator.component';
import { AnnotatorDetailsComponent } from 'app/modules/admin/annotator/details/details.component';
import { annotatorRoutes } from 'app/modules/admin/annotator/annotator.routing';
import { FixedFilesComponent } from 'app/modules/admin/annotator/details/fixed-files.component';
import { StartMiningDialog } from 'app/modules/admin/annotator/dialogs/start.component';
import { TagsPanelComponent } from 'app/modules/admin/annotator/tags/panel.component';


@NgModule({
    declarations: [
        AnnotatorComponent,
        AnnotatorDetailsComponent,
        FixedFilesComponent,
        StartMiningDialog,
        TagsPanelComponent
    ],
    imports     : [
        RouterModule.forChild(annotatorRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatGridListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSidenavModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule
    ]
})
export class AnnotatorModule
{
}