import { Order } from './../../interfaces/models';
import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {Table} from 'primeng/table';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})

export class OrderHistoryComponent implements OnInit, OnDestroy {

  public orderCollection: AngularFirestoreCollection<Order>;
  @ViewChild('dt') public table: Table;
  public orders: Observable<Order[]>;
  columns: any[];
  filterForm: FormGroup;
  filterStatus: string = null;
  public statusFilter: any = null;
  filterSub: Subscription;

  public orderTypeFilter = [
    { label: 'All', value: null },
    { label: 'Delivery', value: 'delivery' },
    { label: 'Pick Up', value: 'pickUp' }

  ]
  constructor(private afs: AngularFirestore, private fb: FormBuilder) {



  }

  ngOnInit() {

    this.orderCollection = this.afs.collection<Order>('orders');
    this.orders = this.orderCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          data.status = this.getStatus(data);
          data.total_items = data.order_items.length;
          const id = a.payload.doc.id;
          return { id,  ...data };
        })
      )
    );
    console.log(this.table);
    this.filterForm = this.fb.group({
      status: [null]
    });

    console.log(this.filterForm);
    this.filterSub = this.filterForm.get('status').valueChanges.subscribe((value) => {
      if (value) {
        this.table.filter(value, 'status', 'equals');
      } else {
        this.table.reset();
      }
    });
  }
  getStatus(order: Order) {
    if (!order.processing) {
      return 'Pending';
    } else {
      if (order.completed) {
        return 'Completed';
      } else {
        return 'Processing';
      }
    }
  }
  filter() {
    console.log(this.statusFilter);
  }
  ngOnDestroy(): void {
    this.filterSub.unsubscribe();
  }
  getInitials(firstName:string,lastName:string){
    const firstInitial = firstName.split('')[0];
    const lastInitial = lastName.split('')[0];
    return firstInitial + lastInitial;
  }
  mapDeliveryType(type: 'pickUp' | 'dineIn' | 'delivery') {
    switch (type) {
      case ('pickUp'):
        return 'Pick Up';
      case ('dineIn'):
        return 'Dine In';
        break;
      case ('delivery'):
        return 'Delivery';
        break;
      default: return 'Pick Up';
    }
  }

}
