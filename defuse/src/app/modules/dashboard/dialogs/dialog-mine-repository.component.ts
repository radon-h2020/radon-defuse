import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'dialog-mine-repository',
  templateUrl: './dialog-mine-repository.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogMineRepositoryComponent implements OnInit {

    languages = [
        {value: 'ansible', viewValue: 'Ansible'},
        {value: 'tosca', viewValue: 'Tosca'}
    ]

    selectedLanguage: string;

    ngOnInit(): void {
        this.selectedLanguage = null;
    }

}
