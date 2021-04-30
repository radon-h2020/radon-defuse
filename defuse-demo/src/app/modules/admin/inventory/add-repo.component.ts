import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'add-repo-dialog',
  templateUrl: './add-repo.component.html',
})
export class AddRepositoryDialogComponent {

    public data: AddRepositoryDialogData = {url: '', token: ''}

    constructor(public dialogRef: MatDialogRef<AddRepositoryDialogComponent>){ }

    cancel(){
        this.dialogRef.close(this.data)
    }
}


export interface AddRepositoryDialogData {
  url: string;
  token: string;
}
