import { Component, OnInit, ViewEncapsulation } from '@angular/core';

export interface DialogAddRepositoryComponentData{
    url: string,
    token?: string
}

@Component({
  selector: 'app-dialog-add-repository',
  templateUrl: './dialog-add-repository.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogAddRepositoryComponent implements OnInit {

  data: DialogAddRepositoryComponentData
  constructor() {
    this.data = {
        url: undefined,
        token: undefined
    }
  }

  ngOnInit(): void {
  }

}
