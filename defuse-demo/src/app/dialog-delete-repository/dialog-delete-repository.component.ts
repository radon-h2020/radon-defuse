import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogDeleteRepositoryData{
    full_name: string
}

@Component({
  selector: 'app-dialog-delete-repository',
  templateUrl: './dialog-delete-repository.component.html',
  styleUrls: ['./dialog-delete-repository.component.scss']
})
export class DialogDeleteRepositoryComponent implements OnInit {
    canDelete: boolean

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogDeleteRepositoryData) {
        this.canDelete = false
    }

    ngOnInit(): void {
    }

    checkFullName(value){
        this.canDelete = value === this.data.full_name
    }
}
