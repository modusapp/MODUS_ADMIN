import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'item-description',
  templateUrl: './item-description.component.html',
  styleUrls: ['./item-description.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ItemDescriptionComponent {
  @Input() public description: string = '';

  public accordion: boolean[] = [false, false, false];

  toggleAccordion(id) {
    const newAccordion = [...this.accordion];
    newAccordion[id] = !newAccordion[id];
    this.accordion = newAccordion;
  }

}
