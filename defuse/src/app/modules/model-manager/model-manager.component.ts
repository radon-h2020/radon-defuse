import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-model-manager',
  templateUrl: './model-manager.component.html',
  styleUrls: ['./model-manager.component.scss']
})
export class ModelManagerComponent implements OnInit {

    repositoryId: string

    models = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    constructor(private activatedRoute: ActivatedRoute) {
        this.repositoryId = this.activatedRoute.snapshot.paramMap.get("id");
    }

    ngOnInit(): void {
    }

}
