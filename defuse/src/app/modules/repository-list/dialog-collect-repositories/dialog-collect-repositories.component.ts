import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-dialog-collect-repositories',
  templateUrl: './dialog-collect-repositories.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DialogCollectRepositoriesComponent implements OnInit {

    dateRange = new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
    });

    constructor() {

    }

    ngOnInit(): void {

    }

}
