import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-detail-page',
  templateUrl: './order-detail-page.component.html',
  styleUrls: ['./order-detail-page.component.scss']
})
export class OrderDetailPageComponent implements OnInit,OnDestroy {

  routeSub: Subscription;
  fieldId: any;

  constructor(private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.routeSub = this.activeRoute.params.subscribe((params) => {
      console.log(params);
      this.fieldId = params.id;


    });
  }
  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

}
