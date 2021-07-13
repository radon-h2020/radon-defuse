import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'model-manager-details',
  templateUrl: './details.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ModelManagerDetailsComponent{
    @Input() item;
    @Output() delete = new EventEmitter<string>();
    @Output() dismiss = new EventEmitter<string>();
    @Output() download = new EventEmitter<string>();
    @Output() chart = new EventEmitter<string>();

    onDelete(){
        this.delete.emit();
    }

    onDismiss(){
        this.dismiss.emit();
    }

    onDownload(){
        this.download.emit();
    }

    onVisualizePerformance(){
        this.chart.emit(this.item.content.id);
    }
}
