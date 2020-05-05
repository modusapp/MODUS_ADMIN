import { Component, OnDestroy } from '@angular/core';

import mock, { toggle } from './products.mock';
import mockFilters from './filters.mock';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import {Product, Category}  from '../../interfaces/models';
import { map, switchMap } from 'rxjs/operators';
import {isNil} from 'lodash';
export interface CategoryId extends Category {
  id: string;
}
@Component({
  selector: '[product-grid]',
  templateUrl: './product-grid.template.html',
  styleUrls: ['./product-grid.style.scss', './product-card.style.scss']
})
export class ProductGridComponent implements OnDestroy {

  public filters = mockFilters;
  public activeModalFilter: number = null;

  private productsCollection: AngularFirestoreCollection<Product>;

  private products: Observable<Product[]>;

  categoryCollection: AngularFirestoreCollection<Category>;

  categories: Observable<any[]>;
  filter: any = {
    category: null,
    in_stock: true,
    on_sale: false
  };
  categoryFilter$: BehaviorSubject<string|null>;
  stockFilter$: BehaviorSubject<boolean|null>;
  saleFilter$: BehaviorSubject<boolean|null>;

  categoryList: any[];
  categorySub: Subscription;
  constructor(private afs: AngularFirestore) {
  this.categoryFilter$ = new BehaviorSubject(null);
  this.stockFilter$ = new BehaviorSubject(null);
  this.saleFilter$ = new BehaviorSubject(null);
  this.productsCollection = this.afs.collection<Product>('products');

  this.products = combineLatest(
    this.categoryFilter$,
    this.stockFilter$,
    this.saleFilter$
  ).pipe(
    switchMap(([category, stock, sale]) =>
      afs.collection('products', ref => {
        let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        
        if (category) { query = query.where('category', '==', category); }
        if (sale) { query = query.where('on_sale', '==', sale); }
        if (!isNil(stock)) {query = query.where('in_stock', '==', stock);}
        return query;
      }).snapshotChanges().pipe(
        map(actions =>
          actions.map(a => {
            const data = (a.payload.doc.data() as Product);
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
    )
  );



    this.categoryCollection = afs.collection<Category>(
      'categories'
    );
    this.categories = this.categoryCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = (a.payload.doc.data() as Category);
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );

    this.initFilter();
  }
  public changeItem = function(id) {
    toggle.call(this, id);
  };

  public openModal(id) {
    this.activeModalFilter = id;
    console.log(this.activeModalFilter);
  }

  public closeModal() {
    this.activeModalFilter = null;
  }
  initFilter() {
    this.categorySub = this.categories.subscribe((cat: Category[]) => {
      this.categoryList = [{id:null,name:'All'}].concat(cat);
      console.log(this.categoryList);
    });
    this.filters =  {
      mainFilters: [
        {
          id: 0,
          name: 'Category',
          items: this.categoryList,
          checked: ''
        }

      ],
      sortFilter: {
        id: 5,
        name: 'Sort',
        items: ['Favorite', 'Price', 'Popular'],
        checked: ''
      }
    };
  }
  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
  }
  calculatePercent(oldPrice: number, newPrice: number) {
    return     Math.abs((newPrice - oldPrice) / oldPrice);

  }
  filterByCategory(category: string | null) {
    this.categoryFilter$.next(category);

  }
  filterByStock(value) {
    this.stockFilter$.next(value === true? !value:null);
  }
  filterBySale(value) {
    this.saleFilter$.next(value);
  }
  scrollHandler(e) {
    console.log(e)
    // should log top or bottom
  }

}
