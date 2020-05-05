import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'banner',
  templateUrl: './banner.template.html',
  styleUrls: ['./banner.style.scss']
})
export class BannerComponent {
  @Input() image: string = '';
  @Input() title: string = '';
  @Input() price: string = '';
  @Input() id: string = '';
  @Output() OnDelete = new EventEmitter();


  constructor() {}
  delete() {
    console.log('emitting');
    this.OnDelete.emit();
  }
}
