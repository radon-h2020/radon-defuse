import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

    id: string

    constructor(private activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.id=this.activatedRoute.snapshot.paramMap.get("id");
    }

}
