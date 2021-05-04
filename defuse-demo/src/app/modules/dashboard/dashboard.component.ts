import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { CommitModel } from 'app/models/commit.model';
import { CommitsService } from 'app/services/commits.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {

    repositoryId: string

    // Commits
    commits: CommitModel[] = [];
    dataSourceCommits: MatTableDataSource<CommitModel>;
    displayedColumnsTableCommits: string[] = ['hash', 'msg', 'defects'];
    @ViewChild('PaginatorCommits') paginatorCommits: MatPaginator;

    constructor(private activatedRoute: ActivatedRoute,
                private commitsService: CommitsService,
                private snackBar: MatSnackBar) {

        this.repositoryId = this.activatedRoute.snapshot.paramMap.get("id");
        this.commitsService.initializeCommits(this.repositoryId)

        this.commitsService.getAll().subscribe(commits => {
            this.commits = commits
            this.dataSourceCommits = new MatTableDataSource<CommitModel>(this.commits);
        });

        // Initialize list of fixing-commits
        //this.commitsService.repositoryId = this.repositoryId
        //this.commitsService.getAll().subscribe(commits => { this.commits = commits });
    }

    ngOnInit(): void {
        this.repositoryId = this.activatedRoute.snapshot.paramMap.get("id");
        this.dataSourceCommits = new MatTableDataSource<CommitModel>(this.commits);
    }

    ngAfterViewInit() {
      this.dataSourceCommits.paginator = this.paginatorCommits;
      //this.dataSourceFiles.paginator = this.paginatorFiles;
    }

    searchCommits(filterValue: string) {
      this.dataSourceCommits.filter = filterValue.trim().toLowerCase();
    }
}


