import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

export interface DialogCollectRepositoriesComponentData{
    dateRange: FormGroup,
    language: string,
    minReleases?: number
    minStars?: number
    minWatchers?: number
    pushedAfter?: string
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
        {value: 'tosca', viewValue: 'Tosca'}
    ]

    constructor() {
        this.data = {
            dateRange: new FormGroup({
                start: new FormControl(new Date()),
                end: new FormControl(new Date()),
            }),
            language: this.languages[0].value,
            minReleases: 0,
            minStars: 0,
            minWatchers: 0,
            pushedAfter: new FormControl(new Date()).value
        }
    }

    ngOnInit(): void {

    }

}
