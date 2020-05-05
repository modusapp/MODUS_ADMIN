import { AuthService } from './../../../services/auth.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { OrderLineItem } from './../../../interfaces/models';
import { Observable, Subscription } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../interfaces/models';
import { take } from 'rxjs/operators';
import * as _ from 'underscore';
import * as moment from 'moment';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  @Input() public id: string = '';
  order: Order;
  orderObservable: Observable<any>;
  orderSubscription: Subscription;
  ready: boolean = false;
  constructor(
    private afs: AngularFirestore,
    private orderService: OrderService,
    private messageService: MessageService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    console.log('RECEIVED ORDER ID', this.id);
    this.orderService.orderCollection
      .doc(this.id)
      .ref.get()
      .then(doc => {
        this.order = doc.data() as Order;
        this.orderService
          .getOrderProducts(this.order.order_items)
          .then(orderLineItems => {
            this.order.order_items = orderLineItems;
            console.log(this.order);
            console.log(this.auth.userInfo);
            this.ready = true;
          });
      });
  }
  mapItem(item: OrderLineItem) {
    const description = [];
    item.options.forEach((option, index) => {
      const data = {
        id: index,
        title: option.option_name
      };
      const beginTag = '<ul class="description-list">';
      const endTag = '</ul>';
      const body = [beginTag];
      const valueLength = option.values.length;
      option.values.forEach((val) => {
        if (option.has_checkbox && !val.checked) {

        } else {
          const valueTag =
            `<li>Value: <span class="fw-semi-bold"> ` +
            val.name + (valueLength > 1 ? `</span>` : `</span></li>`);
          body.push(valueTag);
          const priceTag =
            `<li>Modifier: <span class="fw-semi-bold"> $` +
            val.add_price +
            (option.has_quantity ? ' x ' + val.quantity : '') +
            `</span></li>`;
          if (valueLength > 1) {
            body.push(`<ul style='list-style-type: none;'>`);
            body.push(priceTag);
            if (option.has_quantity) {
              const quantityTag =
                `<li>Quantity: <span class="fw-semi-bold"> ` +
                val.quantity +
                `</span></li>`;
              body.push(quantityTag);
            }
            body.push(`</ul>`);
            body.push(`</li>`);
          } else {
            body.push(priceTag);
            if (option.has_quantity) {
              const quantityTag =
                `<li>Quantity: <span class="fw-semi-bold"> ` +
                val.quantity +
                `</span></li>`;
              body.push(quantityTag);
            }
          }
        }


      });
      body.push(endTag);

      data['body'] = body.join('');
      description.push(data);

    });
    return description;
  }
  setProcessingStatus(value) {
    console.log(value);
    const order = Object.assign({}, this.order);
    console.log(order);
    order.processing = value;
    order.user_id = this.auth.userInfo.uid;
    order.user = this.auth.profileInfo;
    order.user.uid = this.auth.userInfo.uid;
    const orderId = this.id;
    delete order.id;
    console.log(order);
    this.orderService.orderCollection
      .doc(orderId)
      .ref.set(order)
      .then(() => {
        this.order = order;
      })
      .catch(err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'Unable to update product at this time. Please try again later.'
        });
      });
  }
  public setComplete() {
    const order = Object.assign({}, this.order);
    order.completed = true;
    order.completed_at = Date.now();
    const orderId = order.id;
    delete order.id;
    console.log(order);
    this.orderService.orderCollection
      .doc(this.id)
      .ref.set(order)
      .then(() => {
        this.order = order;
      })
      .catch(err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'Unable to update product at this time. Please try again later.'
        });
      });
  }
  testCollapse(event) {
    console.log(event);
  }
  getInitials(firstName: string, lastName: string) {
    const firstInitial = firstName.split('')[0];
    const lastInitial = lastName.split('')[0];
    return firstInitial + lastInitial;
  }
  convertAddressToLink(address) {
    return "http://maps.google.com/maps?q=" + encodeURIComponent(address);
  }
  isWithinPickupWindow(startTime, endTime) {
    startTime = moment(startTime);
    endTime = moment(endTime);

    return moment().isBetween(startTime, endTime, 'minutes');
  }
  getPickupType(type: string) {
    switch (type) {
      case ('togo'):
        return 'To-Go';
        break;
      case ('dineIn'):
        return 'Dine In';
        break;
      case ('drive'):
        return 'Drive-N-Go';
        break;
    }
  }
}
