import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { DialogAddRepositoryComponent } from './dialog-add-repository/dialog-add-repository.component';
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
        MatButtonModule,
        MatDividerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule
];

@NgModule({
    declarations: [
        DialogAddRepositoryComponent,
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
