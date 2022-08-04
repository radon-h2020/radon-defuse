import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TaskLogDialog {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}