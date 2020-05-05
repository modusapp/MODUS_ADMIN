import { MessageService } from 'primeng/components/common/messageservice';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { Product, Category } from '../../interfaces/models';
import { map, flatMap } from 'rxjs/operators';
import { Observable, forkJoin, combineLatest } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { Http } from '@angular/http';

@Component({
  selector: 'app-category-view',
  templateUrl: './category-view.component.html',
  styleUrls: ['./category-view.component.scss']
})
export class CategoryViewComponent implements OnInit {
  categoryCollection: AngularFirestoreCollection<Category>;

  categories: Observable<any[]>;


  public processing: boolean = false;
  public totalCategories: number = 0;
  constructor(
    private afs: AngularFirestore,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private http: Http
  ) { }

  ngOnInit() {
    this.categoryCollection = this.afs.collection<Category>('categories', (ref) => ref.orderBy('index', 'asc'));
    this.categories = this.categoryCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Category;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      ),
      flatMap(actions => {
        this.totalCategories = actions.length;
        return this.transformCategories(actions);
      })
    );
  }
  deleteCategory(category: Category) {
    console.log(category, category.productCount === 0);
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete ' + category.name + ' as a category?',
      accept: () => {
        if (category.productCount === 0) {
          this.categoryCollection
            .doc(category.id)
            .ref.delete()
            .then(() => {
              this.messageService.add({
                severity: 'info',
                summary: 'Success',
                detail: 'Category deleted.'
              });
            })
            .catch(err => {
              console.log(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Unable to delete at this time. Please try again later.'
              });
            });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'This category belongs to an existing product(s). Please change the category of those products before deleting.'
          });
        }
      }
    });
  }
  transformCategories(categoryList: any[]): Observable<Category[]> {
    const list = categoryList.map(cat => this.getCategoryCounts(cat));
    return combineLatest(list);
  }

  moveCategoryUp(index) {
    this.processing = true;

    this.http.post('https://us-central1-coffessions-server.cloudfunctions.net/moveCategoryIndex', { docIndex: index, shift: 'up' })
    .pipe(map(res => res.json()))
    .subscribe((response) => {
        console.log(response);
        if(!response.success){
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Internal server error'
          });
        }
        this.processing = false;
      }, (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Internal server error'
        });
        this.processing = false;
      });
  }
  moveCategoryDown(index) {
    this.processing = true;

    this.http.post('https://us-central1-coffessions-server.cloudfunctions.net/moveCategoryIndex', { docIndex: index, shift: 'down' })
    .pipe(map(res => res.json()))
    .subscribe((response) => {
        console.log(response);
        if(!response.success){
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Internal server error'
          });
        }
        this.processing = false;
      }, (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Internal server error'
        });
        this.processing = false;
      });
  }

  getCategoryCounts(category: Category) {
    return this.afs
      .collection('products', ref => ref.where('category', '==', category.id))
      .snapshotChanges()
      .pipe(
        map(item => {
          category.productCount = item.length;
          return category;
        })
      );
  }
}
