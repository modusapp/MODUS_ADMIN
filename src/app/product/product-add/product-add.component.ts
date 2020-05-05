import { Location } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import * as models from '../../interfaces/models';
import { FormBuilder, Validators, FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import {map, startWith, finalize} from 'rxjs/operators';
export interface CategoryId extends models.Category {
  id: string;
}
import { AngularFireStorage } from '@angular/fire/storage';
import { MessageService } from 'primeng/components/common/messageservice';
import { Router } from '@angular/router';

@Component({
  selector: 'product-add',
  templateUrl: 'product-add.component.html',
  styleUrls: ['product-add.component.scss']
})
export class ProductAddComponent implements OnDestroy {

  form: FormGroup;
  categoryCollection: AngularFirestoreCollection<models.Category>;
  categories: Observable<CategoryId[]>;
    productCollection: AngularFirestoreCollection<models.Product>;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  saleSub: Subscription;

  constructor(private fb: FormBuilder, private fireStore: AngularFirestore, private storage: AngularFireStorage, private messageService: MessageService, private router: Router, private _location: Location) {
    this.categoryCollection = fireStore.collection<models.Category>(
      'categories'
    );
    this.productCollection = fireStore.collection<models.Product>('products');
    this.categories = this.categoryCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = (a.payload.doc.data() as models.Category);
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
    console.log(this.categories);
    this.form = this.fb.group({
      name: [null, Validators.required],
      base_price: [0, Validators.required],
      category: ['', Validators.required],
      description: [''],
      photo: ['', Validators.required],
      options: this.fb.array([]),
      in_stock: [true],
      on_sale: [false],
      sale_base_price: [null],
      available_on_mobile: [true]
    });
    this.saleSub = this.form.get('on_sale').valueChanges.subscribe((checked) => {
      console.log(checked);
      if (checked) {
        this.form.get('sale_base_price').setValidators([Validators.required]);
      } else {
        this.form.get('sale_base_price').reset();

        this.form.get('sale_base_price').clearValidators();
      }
      this.form.get('sale_base_price').updateValueAndValidity();
      console.log(this.form.get('sale_base_price').validator);
    });
    console.log(this.form);
  }

  saveProduct() {
    if (!this.form.valid) {
      this.setAsTouched(this.form);
      console.log(this.form);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter all required fields.'
      });
    } else {
      const value = Object.assign({}, this.form.value);
      console.log(value);
      this.productCollection.add(value).then((res) => {
          console.log(res);
          this.messageService.add({severity: 'success', summary: 'Success',  detail: 'Product created.'});
          setTimeout(() => {
            this.router.navigate(['/app/product/product-detail/', res.id]);
          }, 1000);
      }).catch((err) => {
          console.log(err);
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Unable to create product at this time. Please try again later.'});
      });
    }

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
        } )
     )
    .subscribe();
  }
  addOption() {
      const optionArray = this.form.controls['options'] as FormArray;

      optionArray.push(this.fb.group({
        option_name: ['', Validators.required],
        radio: [null, Validators.required],
        has_quantity: [false, Validators.required],
        has_checkbox: [null, Validators.required],
        required: [false, Validators.required],
        terms: this.fb.array([
            this.fb.group({
                name: ['', Validators.required],
                add_price: [0, Validators.required],
                default: [true]

            })
        ])
      }));
      console.log(this.form);
  }
  addTerm(i) {
    const termArray = (this.form.get('options') as FormArray).controls[i].get('terms') as FormArray;
    termArray.push(this.fb.group({
      name: ['', Validators.required],
      add_price: [0, Validators.required],
      default: [false]

  }));
    console.log(termArray);

    console.log(this.form.value);
  }
  getFormOptions() {
    return <FormArray>this.form.get('options');
  }
  removeTerm(i, k) {
    const termArray = (this.form.get('options') as FormArray).controls[i].get(
      'terms'
    ) as FormArray;
    termArray.removeAt(k);

  }
  isRadio(i) {
    const optionArray = this.form.get('options') as FormArray;
    const value = optionArray.controls[i].get('radio').value;
    return value;
  }
  isCheckbox(i) {
    const optionArray = this.form.get('options') as FormArray;
    const value = optionArray.controls[i].get('has_checkbox').value;
    return value;
  }
  hasQuantity(i) {
    const optionArray = this.form.get('options') as FormArray;
    const value = optionArray.controls[i].get('has_quantity').value;
    return value;

  }

  switchRequired(i,value){
    console.log(value);
    const optionArray = this.form.get('options') as FormArray;
    optionArray.controls[i].get('required').setValue(value);
  }
  removeOption(i) {
    const optionArray = this.form.get('options') as FormArray;
    optionArray.removeAt(i);
  }

  setAsTouched(group: FormGroup | FormArray) {
    group.markAsTouched();
    for (const i in group.controls) {
      if (group.controls[i] instanceof FormControl) {
        group.controls[i].markAsTouched();
      } else {
        this.setAsTouched(group.controls[i]);
      }
     }
   }
   ngOnDestroy(): void {
    this.saleSub.unsubscribe();
  }
  cancel() {
    this._location.back();
  }
  setDefault(i, k) {
    const termArray = (this.form.get('options') as FormArray).controls[i].get(
      'terms'
    ) as FormArray;
    const termGroup =  termArray.controls[k] as FormGroup;
    termArray.controls.map((group: FormGroup) => {
      group.controls['default'].setValue(false);
      return group;
    });
    return termGroup.get('default').setValue(true);


  }
  getTerm(i, k) {
    const termArray = (this.form.get('options') as FormArray).controls[i].get(
      'terms'
    ) as FormArray;
    const termGroup =  termArray.controls[k] as FormGroup;
    return termGroup.get('default').value;
  }
  isRequired(i) {
    const optionArray = this.form.get('options') as FormArray;
    const value = optionArray.controls[i].get('required').value;
    return value;

  }
  validOption(i) {
    const optionArray = this.form.get('options') as FormArray;
    const has_checkbox = optionArray.controls[i].get('has_checkbox');
    const has_radio = optionArray.controls[i].get('radio');

    return (optionArray.controls[i].dirty && ( (has_checkbox.errors ? has_checkbox.errors.required : false) && (has_radio.errors ? has_radio.errors : false)));
  }
}
