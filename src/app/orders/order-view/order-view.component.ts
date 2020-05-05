import { AuthService } from "./../../services/auth.service";
import { MessageService } from "primeng/components/common/messageservice";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { OrderService } from "./../../services/order.service";
import { Component, OnInit } from "@angular/core";
import { Order } from "../../interfaces/models";
import { Observable, BehaviorSubject, combineLatest } from "rxjs";
import { switchMap, map, flatMap } from "rxjs/operators";
import * as _ from "lodash";
import { Http } from '@angular/http';
import * as moment from 'moment';

@Component({
  selector: "app-order-view",
  templateUrl: "./order-view.component.html",
  styleUrls: ["./order-view.component.scss"]
})
export class OrderViewComponent implements OnInit {
  orderList: Observable<Order[]>;
  viewDetails: boolean = false;
  activeOrderId: string = null;
  $prepFilter: BehaviorSubject<string | null>;
  $filterByBartender: BehaviorSubject<boolean | null>;
  $filterByKitchen: BehaviorSubject<boolean | null>;
  $filterByBarista: BehaviorSubject<boolean | null>;

  preparationOptions: string[];

  prepList: string[] = ["kitchen", "bartender", "barista"];

  public orderCollection: AngularFirestoreCollection<Order>;

  mobile: boolean = false;
  constructor(
    private afs: AngularFirestore,
    public orderService: OrderService,
    private messageService: MessageService,
    public auth: AuthService,
    private http: Http
  ) {
    this.$filterByBartender = new BehaviorSubject(null);
    this.$filterByKitchen = new BehaviorSubject(null);
    this.$filterByBarista = new BehaviorSubject(null);
  }

  ngOnInit() {
    if (window.screen.width < 450) { // 768px portrait
      this.mobile = true;
    }
   }
  getStyle(order) {
    let styleClass = ["list-group-item"];
    if (order.processing) {
      styleClass = ["list-group-item", "list-group-item-warning"];
    }
    return styleClass;
  }
  getPillStyle(prep) {
    switch (prep) {
      case "barista":
        return "#f47742";
        break;
      case "bartender":
        return "#f4d041";
        break;
      case "kitchen":
        return "#417ff4";
        break;
      default:
        return "#f47742";
    }
  }
  setProcessingStatus(value, order: Order) {
    console.log(value);
    order.processing = value;
    order.user_id = this.auth.userInfo.uid;
    order.user = this.auth.profileInfo;
    order.user.uid = this.auth.userInfo.uid;
    const orderId = order.id;
    delete order.id;
    console.log(order);
    this.orderService.orderCollection
      .doc(orderId)
      .ref.set(order)
      .then(() => { })
      .catch(err => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail:
            "Unable to update product at this time. Please try again later."
        });
      });
  }
  public setComplete(value, order: Order) {
    console.log(value);
    order.completed = value;
    order.completed_at = Date.now();
    const orderId = order.id;
    delete order.id;
    console.log(order);
    this.orderService.orderCollection
      .doc(orderId)
      .ref.set(order)
      .then(() => { })
      .catch(err => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail:
            "Unable to update product at this time. Please try again later."
        });
      });
  }
  viewDetailsPane(orderId) {
    this.activeOrderId = orderId;
    this.viewDetails = true;
  }
  hideDetailsPane() {
    this.activeOrderId = null;
    this.viewDetails = null;
  }
  getInitials(firstName: string, lastName: string) {
    const firstInitial = firstName.split("")[0];
    const lastInitial = lastName.split("")[0];
    return firstInitial + lastInitial;
  }

  filterByBarista(value) {
    this.orderService.$filterByBarista.next(value);
  }
  filterByKitchen(value) {
    this.orderService.$filterByKitchen.next(value);
  }
  filterByBartender(value) {
    this.orderService.$filterByBartender.next(value);
  }
  filterByDelivery(value) {
    this.orderService.$filterByDelivery.next(value);
  }
  filterByPickUp(value) {
    this.orderService.$filterByPickUp.next(value);
  }
  filterByDineIn(value) {
    this.orderService.$filterByDineIn.next(value);
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
      default: return 'NA';
    }
  }
  isWithinPickupWindow(startTime, endTime){
     startTime = moment(startTime);
     endTime = moment(endTime);

     return moment().isBetween(startTime,endTime, 'minutes');
  }
  convertAddressToLink(address){
    return "http://maps.google.com/maps?q=" + encodeURIComponent( address );
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
