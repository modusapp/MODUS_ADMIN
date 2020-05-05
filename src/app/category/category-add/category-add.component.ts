import { Location } from '@angular/common';
import { MessageService } from 'primeng/components/common/messageservice';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../interfaces/models';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import { setAsTouched } from '../../interfaces/get-form-validation-errors';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.scss']
})
export class CategoryAddComponent implements OnInit {
  categoryCollection: AngularFirestoreCollection<Category>;

  categories: Observable<any[]>;
  form: FormGroup;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  preparationOptions:any[];
  totalCategories: number;

  constructor(
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
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
    this.categoryCollection.ref.get().then((snapshot)=>{
      this.totalCategories = snapshot.docs.length;
      console.log(this.totalCategories);
    });
    this.form = this.fb.group({
      name: ['', Validators.required],
      photo:['',Validators.required],
      prepared_by:['',Validators.required],
      available_on_mobile: [true]
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
      const value:Category = Object.assign({}, this.form.value);
      value.index = this.totalCategories;
      console.log(value);
      this.categoryCollection
        .add(value)
        .then(res => {
          console.log(res);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category added.'
          });
          setTimeout(() => {
            this.router.navigate(['/app/category/view']);
          }, 1000);
        })
        .catch(err => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              'Unable to create category at this time. Please try again later.'
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
        } )
     )
    .subscribe();
  }
}
