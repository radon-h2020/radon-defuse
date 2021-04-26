import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  url: string;
  token: string;
}

@Component({
  selector: 'add-repo-dialog',
  templateUrl: './add-repo.component.html',
})
export class AddRepositoryDialogComponent {

    public data: DialogData = {url: '', token: ''}


}
