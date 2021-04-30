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
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

import { DialogAddRepositoryComponent } from './dialog-add-repository/dialog-add-repository.component';
import { DialogDeleteRepositoryComponent } from './dialog-delete-repository/dialog-delete-repository.component';
import { RepositoryListComponent } from './repository-list.component';
import { RepositoryItemComponent } from './repository-item.component';

// import { MatSelectModule } from '@angular/material/select';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { ScrollingModule } from '@angular/cdk/scrolling';
//
// import { MatChipsModule } from '@angular/material/chips'
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatSnackBarModule } from '@angular/material/snack-bar';

// import { ItemComponent } from './item.component';
// import { AddRepositoryDialogComponent } from './add-repo.component';


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
        MatListModule,
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

//         MatChipsModule,
//         ,
//         MatDividerModule,
//         MatGridListModule,
//         MatListModule,
//         MatPaginatorModule,
//         MatSelectModule,
//         MatSnackBarModule,
//         MatSidenavModule,
//         MatTabsModule,
//         MatToolbarModule,
//         MatTooltipModule,
//         ScrollingModule
    ]
})
export class RepositoryListModule
{
}
