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

  languages = [
    {value: 'ansible', viewValue: 'Ansible'},
    {value: 'tosca', viewValue: 'Tosca'}
  ]

  selectedLanguage: string;

  ngOnInit(): void {
      this.selectedLanguage = null // this.languages[0].value;
  }

}