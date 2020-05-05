import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Order } from '../../interfaces/models';
import { GeoJson, FeatureCollection } from '../../interfaces/map.interfaces';
import { AngularFirestore } from '@angular/fire/firestore';
import { OrderService } from '../../services/order.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';
import * as mapboxgl from 'mapbox-gl';


@Component({
  selector: 'app-customer-map',
  templateUrl: './customer-map.component.html',
  styleUrls: ['./customer-map.component.scss']
})
export class CustomerMapComponent implements OnInit, OnDestroy {
  markers: Observable<GeoJson[]>;
  source: FeatureCollection;
  sub: Subscription;
  shopAddress: any = {lat: 42.123921, lng: -87.928199};
  @ViewChild('map') map: mapboxgl.Map;
  constructor(private afs: AngularFirestore, public orderService: OrderService, private messageService: MessageService, public auth: AuthService) { }

  ngOnInit() {
    this.markers = this.orderService.orders.pipe(map(orderArray => {
      console.log(orderArray);
      const trackedOrders =  orderArray.filter((order: Order) => {
        return (typeof order.location_information !== 'undefined'  && order.location_information.tracking_enabled && !order.completed && (order.location_information.lat && order.location_information.lng));
      });
      console.log(trackedOrders);
      return trackedOrders.map((order: Order) => {
        return new GeoJson([order.location_information.lng, order.location_information.lat], {order: order, firstName: this.getFirstInitial(order.customer_name), iconColor: this.random_bg_color()});

      });
    }));
    this.sub = this.markers.subscribe((orders) => {
      console.log(orders);

      this.source = new FeatureCollection(orders);
    });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initMap(map) {
    console.log(this.map);
  }
  getInitials(firstName: string, lastName: string) {
    const firstInitial = firstName.split('')[0];
    const lastInitial = lastName.split('')[0];
    return firstInitial + lastInitial;
  }
  getFirstInitial(firstName: string) {
    return  firstName.split('')[0];

  }
  random_bg_color() {
    const x = Math.floor(Math.random() * 256);
    const y = Math.floor(Math.random() * 256);
    const z = Math.floor(Math.random() * 256);
    return 'rgb(' + x + ',' + y + ',' + z + ')';

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
    getStyle(order) {
      let styleClass = ['list-group-item'];
      if (order.processing) {
        styleClass = ['list-group-item', 'list-group-item-warning'];
      }
      return styleClass;
    }
    getDistance(lat1, lon1, lat2, lon2) {
      const radlat1 = Math.PI * lat1 / 180;
      const radlat2 = Math.PI * lat2 / 180;
      const radlon1 = Math.PI * lon1 / 180;
      const radlon2 = Math.PI * lon2 / 180;
      const theta = lon1 - lon2;
      const radtheta = Math.PI * theta / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344;
      dist = dist * 0.621371;
     return Math.round(dist);
}
}
