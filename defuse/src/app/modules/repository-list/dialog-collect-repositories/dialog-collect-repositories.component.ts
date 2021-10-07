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

    constructor() {
        this.data = {
            dateRange: new FormGroup({
                start: new FormControl(),
                end: new FormControl(),
            }),
            language: undefined,
            minReleases: 0,
            minStars: 0,
            minWatchers: 0,
            pushedAfter: undefined
        }
    }

    ngOnInit(): void {

    }

}
