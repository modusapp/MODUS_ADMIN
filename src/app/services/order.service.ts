import { OrderLineItem, OptionConfig, Product } from './../interfaces/models';
import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestore
} from '@angular/fire/firestore';
import { Observable, defer, combineLatest, ReplaySubject, BehaviorSubject } from 'rxjs';
import { Order } from '../interfaces/models';
import { map, filter, startWith, switchMap, mergeMap } from 'rxjs/operators';
import * as firebase from 'firebase';
import { NGXLogger } from 'ngx-logger';
import { MessageService } from 'primeng/api';
import { Howl, Howler } from 'howler';
import * as _ from 'lodash';
@Injectable()
export class OrderService {
  public orderCollection: AngularFirestoreCollection<Order>;

  testOrderObservable: Observable<Order[]>;
  public orders: ReplaySubject<Order[]> = new ReplaySubject(null);
  public orderList: Order[] = [];
  public orderCount: number = null;

 public $filterByBartender: BehaviorSubject<boolean | null>;
 public $filterByKitchen: BehaviorSubject<boolean | null>;
 public $filterByBarista: BehaviorSubject<boolean | null>;
 public $filterByDelivery: BehaviorSubject<boolean | null>;
 public $filterByPickUp: BehaviorSubject<boolean | null>;
 public $filterByDineIn: BehaviorSubject<boolean | null>;

  constructor(
    private afs: AngularFirestore,
    private logger: NGXLogger,
    private messageService: MessageService
  ) {
    this.orderCollection = this.afs.collection<Order>('orders',);
    this.$filterByBartender = new BehaviorSubject(null);
    this.$filterByKitchen = new BehaviorSubject(null);
    this.$filterByBarista = new BehaviorSubject(null);
    this.$filterByDelivery = new BehaviorSubject(null);
    this.$filterByDineIn = new BehaviorSubject(null);
    this.$filterByPickUp = new BehaviorSubject(null);

    combineLatest(
      this.$filterByBartender,
      this.$filterByKitchen,
      this.$filterByBarista,
      this.$filterByDelivery,
      this.$filterByDineIn,
      this.$filterByPickUp
    ).pipe(
      switchMap(([bartender, kitchen, barista, delivery, dineIn, pickUp]) => {
        console.log(bartender, kitchen, barista, delivery, dineIn, pickUp);
        return this.afs.collection<Order>('orders', ref => {
          let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
          query = query.orderBy('created_at', 'desc');
          query = query.where('completed', '==', false);
          query = query.where('staged','==',true);
          return query;
        }).snapshotChanges().pipe(
          map(actions =>
            {
              if (this.orderCount !== null && this.orderCount < actions.length) {
                this.newOrderNotification();
              }
              this.orderCount = actions.length;
              return actions.map(a => {
                const data = (a.payload.doc.data() as Order);
                const id = a.payload.doc.id;
                return { id, ...data };
              }).filter((order) => {
                if (order.prepared_by ||  order.delivery_type) {
                  let selectedHandlerArray = [];
                  let selectedDeliveryTypeArray = [];
                  if (bartender) { selectedHandlerArray.push('bartender') };
                  if (kitchen) { selectedHandlerArray.push('kitchen') };
                  if (barista) { selectedHandlerArray.push('barista') };
                  if (delivery) { selectedDeliveryTypeArray.push('delivery') };
                  if (dineIn) { selectedDeliveryTypeArray.push('dineIn') };
                  if (pickUp) { selectedDeliveryTypeArray.push('pickUp') };
                  console.log(selectedHandlerArray,selectedDeliveryTypeArray);
                  if (selectedHandlerArray.length === 0 && selectedDeliveryTypeArray.length === 0 ) {
                    return true;
                  }
                  else {
                    const handlerFilter = selectedHandlerArray.length !== 0 ? order.prepared_by.some((r) => selectedHandlerArray.includes(r)) : true; 
                    const deliveryFilter = selectedDeliveryTypeArray.length !== 0 ? selectedDeliveryTypeArray.includes(order.delivery_type) : true;
                    console.log(handlerFilter,deliveryFilter);
                    return (handlerFilter && deliveryFilter);
                  }
                }
                else {
                  return true;
                }
              });
            }
          )
        );
      })
    ).subscribe((data: Order[]) => {
      console.log(data);
      this.orders.next(data);
    });

    this.logger.log('firing');
    this.orders
      .subscribe(orderList => {
      });
  }
  public createTestOrder() {
    const order: Order =
    {
      "completed": false,
      "created_at": Date.now(),
      "customer_name": "TEST ORDER",
      "customer_phone": 8478672535,
      "instructions": "My special instructions",
      "order_items": [
        {
          "options": [],
          "price": 3.25,
          "product_id": "INnCw6qGtaRSajuAlUep",
          "quantity": 1
        },
        {
          "options": [
            {
              "has_checkbox": false,
              "has_quantity": false,
              "option_name": "Caramel Macchiato ",
              "radio": true,
              "required": false,
              "values": [
                {
                  "add_price": 4.79,
                  "default": false,
                  "name": "Grand 16oz"
                }
              ]
            }
          ],
          "price": 4.79,
          "product_id": "TJFGuPXxBJwJdc52WWx6",
          "quantity": 1
        }
      ],
      "processing": false,
      "total_price": 8.04,
      "user": {
        "admin": true,
        "email": "adm@coffeessions.com",
        "firstName": "Ameer",
        "lastName": "Akashe",
        "phoneNumber": "1234567890",
        "photoURL": null,
        "uid": "0wigRtmYHVZtgKpDLCO1JAEgUPz1"
      },
      "user_id": "0wigRtmYHVZtgKpDLCO1JAEgUPz1"
    };

    console.log(order);
    this.orderCollection
      .add(order)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }
  async getOrderProducts(orderItems: OrderLineItem[]) {
    const itemsPromise = orderItems.map(async item => {
      const product = await this.afs
        .collection('products')
        .doc(item.product_id)
        .get()
        .toPromise();
      item.product = product.data() as Product;
      return item;
    });
    return await Promise.all(itemsPromise);
  }
  newOrderNotification() {
    const sound = new Howl({ src: '../../assets/sound/light.mp3' });
    this.messageService.add({
      severity: 'info',
      summary: 'New Order Received'
    });
    sound.play();
  }
  docJoin(afs: AngularFirestore, paths: { [key: string]: string }) {
    return source =>
      defer(() => {
        let parent;
        const keys = Object.keys(paths);

        return source.pipe(
          switchMap(data => {
            // Save the parent data state
            parent = data;

            // Map each path to an Observable
            const docs$ = keys.map(k => {
              const fullPath = `${paths[k]}/${parent[k]}`;
              return afs.doc(fullPath).valueChanges();
            });

            // return combineLatest, it waits for all reads to finish
            return combineLatest(docs$);
          }),
          map(arr => {
            // We now have all the associated douments
            // Reduce them to a single object based on the parent's keys
            const joins = keys.reduce((acc, cur, idx) => {
              return { ...acc, [cur]: arr[idx] };
            }, {});

            // Return the parent doc with the joined objects
            return { ...parent, ...joins };
          })
        );
      });
  }
}
