import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestore
} from '@angular/fire/firestore';
import { Category } from '../../interfaces/models';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { setAsTouched } from '../../interfaces/get-form-validation-errors';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit {
  categoryCollection: AngularFirestoreCollection<Category>;

  categories: Observable<any[]>;
  form: FormGroup;

  fieldId: any;
  category: Category;
  routeSub: any;
  formReady: boolean;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  preparationOptions: any[];

  constructor(
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private _location: Location,
    private storage: AngularFireStorage

  ) {
    this.preparationOptions =
      [
        {value:'bartender',name:'Bartender'},
        {value:'barista',name:'Barista'},
        {value:'kitchen',name:'Kitchen'}
      ];
  }

  ngOnInit() {
    this.categoryCollection = this.afs.collection<Category>('categories');
    this.routeSub = this.activeRoute.params.subscribe(params => {
      console.log(params);
      this.fieldId = params.id;
      this.categoryCollection
        .doc(params.id)
        .ref.get()
        .then(doc => {
          this.category = doc.data() as Category;
          console.log(this.category);
          this.form = this.fb.group({
            name: [this.category.name, Validators.required],
            photo: [this.category.photo ? this.category.photo : ''],
            available_on_mobile: [!_.isNil(this.category.available_on_mobile) ? this.category.available_on_mobile : true],
            prepared_by: [this.category.prepared_by ? this.category.prepared_by : ''],
            index: [this.category.index]
          });
          console.log(this.form);

          this.formReady = true;
        });
    });
  }
  saveCategory() {
    if (!this.form.valid) {
      setAsTouched(this.form);
      console.log(this.form);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter all required fields.'
      });
    } else {
      const value = Object.assign({}, this.form.value);
      console.log(value);
      this.categoryCollection
        .doc(this.fieldId)
        .ref.set(value)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category saved.'
          });
          setTimeout(() => {
            this.router.navigate(['/app/category/view/']);
          }, 1000);
        })
        .catch(err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Unable to update category at this time. Please try again later.'
          });
        });
    }
  }
  cancel() {
    this._location.back();
  }
  uploadImage(event) {
    console.log(event);
    const file = event.target.files[0];
    const filePath = file.name;
    const ref = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    const self = this;

    // observe percentage changes
    this.uploadPercent = task.percentageChanges().pipe(map((percent) => {
      return percent / 100;
    }));
    task.catch((err) => console.log(err));
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = ref.getDownloadURL();
        ref.getDownloadURL().subscribe((res) => {
          self.form.controls['photo'].setValue(res);
        });
      })
    )
      .subscribe();
  }
}
