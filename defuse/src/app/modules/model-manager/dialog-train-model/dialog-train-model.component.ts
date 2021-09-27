import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-dialog-train-model',
  templateUrl: './dialog-train-model.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogTrainModelComponent implements OnInit {

    defects = [
        {value: 'conditional', viewValue: 'Conditional'},
        {value: 'configuration_data', viewValue: 'Configuration data'},
        {value: 'dependency', viewValue: 'Dependency'},
        {value: 'idempotency', viewValue: 'Idempotency'},
        {value: 'security', viewValue: 'Security'},
        {value: 'service', viewValue: 'Service'},
        {value: 'syntax', viewValue: 'Syntax'}
    ]

    languages = [
        {value: 'ansible', viewValue: 'Ansible'},
        {value: 'tosca', viewValue: 'Tosca'}
    ]

    validations = [
        {value: 'release', viewValue: 'per release'},
        {value: 'commit', viewValue: 'per commit'}
    ]

    selectedDefect: string;
    selectedLanguage: string;
    selectedValidation: string;

    constructor() {
        this.selectedDefect = this.defects[0].value;
        this.selectedLanguage = this.languages[0].value;
        this.selectedValidation = this.validations[0].value;
    }

    ngOnInit(): void {
    }

}
