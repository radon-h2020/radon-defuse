import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-log',
  templateUrl: './dialog-log.component.html',
  styleUrls: ['./dialog-log.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TaskLogDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
