import { Location } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import * as models from '../../interfaces/models';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormArray,
  FormControl
} from '@angular/forms';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, finalize } from 'rxjs/operators';
export interface CategoryId extends models.Category {
  id: string;
}
import { AngularFireStorage } from '@angular/fire/storage';
import { MessageService } from 'primeng/components/common/messageservice';
import { ActivatedRoute, Route, Router } from '@angular/router';
import * as _ from 'lodash';
@Component({
  selector: 'product-edit',
  templateUrl: 'product-edit.component.html',
  styleUrls: ['product-edit.component.scss']
})
export class ProductEditComponent implements OnDestroy {
  form: FormGroup;
  categoryCollection: AngularFirestoreCollection<models.Category>;
  categories: Observable<CategoryId[]>;
  productCollection: AngularFirestoreCollection<models.Product>;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  routeSub: Subscription;
  formReady: boolean = false;

  fieldId: any;
  product: models.Product;

  saleSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private fireStore: AngularFirestore,
    private storage: AngularFireStorage,
    private messageService: MessageService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private _location: Location
  ) {
    this.categoryCollection = fireStore.collection<models.Category>(
      'categories'
    );
    this.productCollection = fireStore.collection<models.Product>('products');
    this.routeSub = this.activeRoute.params.subscribe(params => {
      console.log(params);
      this.fieldId = params.id;
      this.productCollection
        .doc(params.id)
        .ref.get()
        .then(doc => {
          this.product = doc.data() as models.Product;
          console.log(this.product);
          this.form = this.fb.group({
            name: [this.product.name, Validators.required],
            base_price: [this.product.base_price, Validators.required],
            category: [this.product.category, Validators.required],
            description: [this.product.description],
            photo: [this.product.photo, Validators.required],
            in_stock: [
              this.product.in_stock !== undefined ? this.product.in_stock : true
            ],
            on_sale: [
              this.product.on_sale !== undefined ? this.product.on_sale : false
            ],
            sale_base_price: [
              this.product.sale_base_price ? this.product.sale_base_price : null
            ],
            available_on_mobile: [!_.isNil(this.product.available_on_mobile) ? this.product.available_on_mobile : true],
            options: this.fb.array(
              this.product.options.map((option: models.ProductOption) => {
                return this.fb.group({
                  option_name: [option.option_name, Validators.required],
                  radio: [option.radio, Validators.required],
                  has_quantity: [option.has_quantity, Validators.required],
                  has_checkbox: [
                    option.has_checkbox ? option.has_checkbox : false
                  ],
                  required: [{ value: option.required ? option.required : false, disabled: option.has_checkbox }],
                  terms: this.fb.array(
                    option.terms.map((term: models.OptionTerm) => {
                      return this.fb.group({
                        name: [term.name, Validators.required],
                        add_price: [term.add_price, Validators.required],
                        default: [term.default ? term.default : false]
                      });
                    })
                  ),
                });
              })
            )
          });
          this.saleSub = this.form
            .get('on_sale')
            .valueChanges.subscribe(checked => {
              console.log(checked);
              if (checked) {
                this.form
                  .get('sale_base_price')
                  .setValidators([Validators.required]);
              } else {
                this.form.get('sale_base_price').reset();
                this.form.get('sale_base_price').clearValidators();
              }
              this.form.get('sale_base_price').updateValueAndValidity();
              console.log(this.form.get('sale_base_price').validator);
            });
          console.log(this.form);

          this.formReady = true;
        });
    });
    this.categories = this.categoryCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as models.Category;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
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
      this.productCollection
        .doc(this.fieldId)
        .ref.set(value)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product saved.'
          });
          setTimeout(() => {
            this.router.navigate([
              '/app/product/product-detail/',
              this.fieldId
            ]);
          }, 1000);
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
  }
  uploadImage(event) {
    console.log(event);
    const file = event.target.files[0];
    const filePath = file.name;
    const ref = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    const self = this;

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    task.catch(err => console.log(err));
    // get notified when the download URL is available
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = ref.getDownloadURL();
          ref.getDownloadURL().subscribe(res => {
            self.form.controls['photo'].setValue(res);
          });
        })
      )
      .subscribe();
  }
  addOption() {
    const optionArray = this.form.controls['options'] as FormArray;

    optionArray.push(
      this.fb.group({
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
      })
    );
    console.log(this.form);
  }
  addTerm(i) {
    const termArray = (this.form.get('options') as FormArray).controls[i].get(
      'terms'
    ) as FormArray;
    const term = this.fb.group({
      name: ['', Validators.required],
      add_price: [0, Validators.required],
      default: [false]
    });

    termArray.push(
      term
    );
    console.log(termArray);

    console.log(this.form.value);
  }
  getTerm(i, k) {
    const termArray = (this.form.get('options') as FormArray).controls[i].get(
      'terms'
    ) as FormArray;
    const termGroup = termArray.controls[k] as FormGroup;
    return termGroup.get('default').value;
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
  removeOption(i) {
    const optionArray = this.form.get('options') as FormArray;
    optionArray.removeAt(i);
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
  isRequired(i) {
    const optionArray = this.form.get('options') as FormArray;
    const value = optionArray.controls[i].get('required').value;
    return value;

  }
  hasQuantity(i) {
    const optionArray = this.form.get('options') as FormArray;
    const value = optionArray.controls[i].get('has_quantity').value;
    return value;

  }

  switchRequired(i, value) {
    console.log(value);
    const optionArray = this.form.get('options') as FormArray;
    optionArray.controls[i].get('required').setValue(value);
  }
  disableRequired(i, value) {
    const optionArray = this.form.get('options') as FormArray;
    if (value) {
      (optionArray.controls[i] as FormGroup).controls['required'].disable();
      if ((optionArray.controls[i] as FormGroup).controls['required']) {
        (optionArray.controls[i] as FormGroup).controls['required'].setValue(
          false
        );
      }
    } else {
      (optionArray.controls[i] as FormGroup).controls['required'].enable();
    }

  }
  disableRadio(i, value) {
    const optionArray = this.form.get('options') as FormArray;
    if (value) {
      (optionArray.controls[i] as FormGroup).controls['radio'].disable();
      if ((optionArray.controls[i] as FormGroup).controls['radio']) {
        (optionArray.controls[i] as FormGroup).controls['radio'].setValue(
          false
        );
      }
    } else {
      (optionArray.controls[i] as FormGroup).controls['radio'].enable();
    }
    this.disableRequired(i, value);
  }
  disableCheckbox(i, value) {
    const optionArray = this.form.get('options') as FormArray;
    if (value) {
      (optionArray.controls[i] as FormGroup).controls['has_checkbox'].disable();
      if ((optionArray.controls[i] as FormGroup).controls['has_checkbox']) {
        (optionArray.controls[i] as FormGroup).controls[
          'has_checkbox'
        ].setValue(false);
      }
    } else {
      (optionArray.controls[i] as FormGroup).controls['has_checkbox'].enable();
    }
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
    const termGroup = termArray.controls[k] as FormGroup;
    termArray.controls.map((group: FormGroup) => {
      group.controls['default'].setValue(false);
      return group;
    });
    return termGroup.get('default').setValue(true);


  }
  validOption(i) {
    const optionArray = this.form.get('options') as FormArray;
    const has_checkbox = optionArray.controls[i].get('has_checkbox');
    const has_radio = optionArray.controls[i].get('radio');

    return (optionArray.controls[i].dirty && ( (has_checkbox.errors ? has_checkbox.errors.required : false) && (has_radio.errors ? has_radio.errors : false)));
  }
}
