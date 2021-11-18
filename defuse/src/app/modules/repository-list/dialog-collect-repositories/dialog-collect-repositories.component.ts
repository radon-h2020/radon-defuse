import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

export interface DialogCollectRepositoriesComponentData{
    dateRange: FormGroup,
    language: string,
    minReleases?: number
    minStars?: number
    minWatchers?: number
    pushedAfter?: string,
    token: string,
}

@Component({
  selector: 'app-dialog-collect-repositories',
  templateUrl: './dialog-collect-repositories.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogCollectRepositoriesComponent implements OnInit {

    data: DialogCollectRepositoriesComponentData
    languages = [
        {value: 'ansible', viewValue: 'Ansible'},
        {value: 'python', viewValue: 'Python'},
        {value: 'tosca', viewValue: 'Tosca'}
    ]

    minDate: Date;
    maxDate: Date;

    constructor() {
        this.minDate = new Date(2014, 1, 1)
        this.maxDate = new Date()

        this.data = {
            dateRange: new FormGroup({
                start: new FormControl(new Date()),
                end: new FormControl(new Date()),
            }),
            language: this.languages[0].value,
            minReleases: 0,
            minStars: 0,
            minWatchers: 0,
            pushedAfter: new FormControl(new Date()).value,
            token: undefined
        }
    }

    ngOnInit(): void {

    }

}
