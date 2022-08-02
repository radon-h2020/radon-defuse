import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';

import { RepositoriesComponent } from 'app/modules/admin/repositories/repositories.component';
import { RepositoryDetailsComponent } from 'app/modules/admin/repositories/details/details.component';
import { repositoriesRoutes } from 'app/modules/admin/repositories/repositories.routing';
import { AddRepositoryDialog } from './dialogs/add.component';


@NgModule({
    declarations: [
        RepositoriesComponent,
        RepositoryDetailsComponent,
        AddRepositoryDialog
    ],
    imports     : [
        RouterModule.forChild(repositoriesRoutes),
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSidenavModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule
    ]
})
export class RepositoriesModule
{
}
