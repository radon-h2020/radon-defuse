import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'task-item',
  templateUrl: './task-item.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TaskItemComponent{
  @Input() task;
  @Output() deleted = new EventEmitter<string>();

  onDelete(){
    this.deleted.emit(this.task.id);
  }
}
