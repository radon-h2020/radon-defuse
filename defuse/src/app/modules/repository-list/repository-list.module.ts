import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { DialogAddRepositoryComponent } from './dialog-add-repository/dialog-add-repository.component';
import { DialogCollectRepositoriesComponent } from './dialog-collect-repositories/dialog-collect-repositories.component';
import { DialogDeleteRepositoryComponent } from './dialog-delete-repository/dialog-delete-repository.component';
import { RepositoryListComponent } from './repository-list.component';
import { RepositoryItemComponent } from './repository-item.component';


const repositoryListRoutes: Route[] = [
    {
        path     : '',
        component: RepositoryListComponent
    }
];

const modules = [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDividerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSelectModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule
];

@NgModule({
    declarations: [
        DialogAddRepositoryComponent,
        DialogCollectRepositoriesComponent,
        DialogDeleteRepositoryComponent,
        RepositoryItemComponent,
        RepositoryListComponent
    ],
    entryComponents: [DialogAddRepositoryComponent],
    imports     : [
        RouterModule.forChild(repositoryListRoutes),
        ...modules
    ]
})
export class RepositoryListModule
{
}
