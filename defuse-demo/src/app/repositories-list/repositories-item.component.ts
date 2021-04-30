import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'repositories-item',
  templateUrl: './repositories-item.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RepositoryItemComponent{
  @Input() item;
  @Output() deleted = new EventEmitter<string>();

  onDelete(){
    this.deleted.emit(this.item.id);
  }
}
