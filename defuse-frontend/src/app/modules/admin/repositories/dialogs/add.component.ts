import { Component, OnInit, ViewEncapsulation } from '@angular/core';

export interface AddRepositoryData{
    url: string,
    token?: string
}

@Component({
  selector: 'dialog-add-repository',
  templateUrl: './add.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AddRepositoryDialog implements OnInit {

  data: AddRepositoryData
  constructor() {
    this.data = {
        url: undefined,
        token: undefined
    }
  }

  ngOnInit(): void {
  }

}