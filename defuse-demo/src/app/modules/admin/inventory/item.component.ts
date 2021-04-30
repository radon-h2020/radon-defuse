import { Component, OnInit, Input } from '@angular/core';
import {ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'inventory-item',
  templateUrl: './item.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ItemComponent{
  @Input() item;
}