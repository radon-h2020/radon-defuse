import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';

import { RepositoriesComponent } from 'app/modules/admin/repositories/repositories.component';
import { RepositoryDetailsComponent } from 'app/modules/admin/repositories/details/details.component';
import { repositoriesRoutes } from 'app/modules/admin/repositories/repositories.routing';
import { AddRepositoryDialog } from './dialogs/add.component';
import { CollectRepositoriesDialog } from './dialogs/collect.component';


@NgModule({
    declarations: [
        RepositoriesComponent,
        RepositoryDetailsComponent,
        AddRepositoryDialog,
        CollectRepositoriesDialog
    ],
    imports     : [
        RouterModule.forChild(repositoriesRoutes),
        FormsModule, 
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSidenavModule,
        MatSnackBarModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule
    ]
})
export class RepositoriesModule
{
}
