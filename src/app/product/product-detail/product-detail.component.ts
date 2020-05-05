import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import mock from '../product-grid/products.mock';
import DescriptionMock from './description.mock';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { Product, Category } from '../../interfaces/models';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: '[product-detail]',
  templateUrl: './product-detail.template.html',
  styleUrls: ['./product-detail.style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDetailComponent implements OnInit, OnDestroy {


  public description: Array<any> = [];
  private productsCollection: AngularFirestoreCollection<Product>;
  public products: Observable<Product[]>;
  routeSub: Subscription;
  public product: Product;
  public fieldId: any;
  constructor(private router: Router, private afs: AngularFirestore, private activeRoute: ActivatedRoute, private confirmationService: ConfirmationService, private messageService: MessageService) {

  }
  ngOnInit(): void {
    this.productsCollection = this.afs.collection<Product>('products');
    this.routeSub = this.activeRoute.params.subscribe((params) => {
      console.log(params);
      this.fieldId = params.id;
       this.productsCollection.doc(params.id).ref.get().then((doc) => {
        this.initProduct((doc.data() as Product));
      });

    });
  }
  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
  initProduct(product: Product) {
    this.product = product;
    console.log(this.product);
    this.description.push({
      id: 0,
      extraClass: 'description-info',
      title: 'PRODUCT DESCRIPTION',
      body: `<p class="info-article">` + product.description + ` </p>`
    });
    this.product.options.forEach((option, index) => {
      const data = {
        id: index,
        title: option.option_name
      };
      const beingTag = '<ul class="description-list">';
      const endTag = '</ul>';
      let body = '';
      option.terms.forEach((term) => {
        body = body + '<li>' + term.name + '-' + (term.add_price && term.add_price !== 0 ? ' $' + term.add_price : ' free') + '</li>';
      });
      data['body'] = beingTag + body + endTag;
      this.description.push(data);
    });
  }
  deleteProduct() {
    this.confirmationService.confirm({
      header: 'Delete Confirmation',
      message: 'Are you sure you want to delete ' + this.product.name + '?',
      accept: () => {
          this.productsCollection.doc(this.fieldId).ref.delete().then(() => {
            this.messageService.add({severity: 'info', summary: 'Success',  detail: 'Product deleted.'});
            this.router.navigate(['app/product/product-grid']);

          }).catch((err) => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error', detail: 'Unable to delete at this time. Please try again later.'});

          });
      }
  });
  }
}
