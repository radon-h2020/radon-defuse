import { Component, OnInit, ViewEncapsulation } from '@angular/core';

export interface MiningData{
    url: string,
    token?: string
}

@Component({
  selector: 'dialog-start-mining',
  templateUrl: './start.component.html',
  encapsulation: ViewEncapsulation.None
})
export class StartMiningDialog implements OnInit {

  data: MiningData
  constructor() {
    this.data = {
        url: undefined,
        token: undefined
    }
  }

  ngOnInit(): void {
  }

}