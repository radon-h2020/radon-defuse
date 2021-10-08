import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'repository-item',
  templateUrl: './repository-item.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RepositoryItemComponent{
    @Input() item;
    @Output() deleted = new EventEmitter<string>();
    @Output() score = new EventEmitter<string>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ){ }

    onDelete(){
        this.deleted.emit(this.item.id);
    }

    onScore(){
        this.score.emit(this.item.id);
    }
}
