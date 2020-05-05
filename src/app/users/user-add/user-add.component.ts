import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AdminProfile } from '../../interfaces/models';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit {
  private userCollection: AngularFirestoreCollection<AdminProfile>;
  public users: Observable<AdminProfile[]>;
  public form: FormGroup;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.userCollection = this.afs.collection<AdminProfile>('admin_profiles');
    this.users = this.userCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as AdminProfile;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );

    this.form = this.fb.group(
      {
        email: [
          null,
          Validators.compose([Validators.required, Validators.email])
        ],
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required],
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        phoneNumber: [null, this.phoneNumberValidator],
        admin: [false],
        photoURL: [null]
      },
      {
        validator: this.checkPasswords
      }
    );
  }
  saveUser() {
    const value = this.form.value;
    console.log(this.form);
    if (!this.form.valid) {
      this.setAsTouched(this.form);
      console.log(this.form);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter all required fields.'
      });
    } else {
      console.log(value);
    this.authService.registerProfile(value).subscribe((data) => {
      console.log(data);
      if (data.success) {
        this.afs.collection('admin_profiles').doc(data.user.uid).set({
          admin: value.admin,
          firstName: value.firstName,
          lastName: value.lastName,
          photoURL: value.photoURL,
          phoneNumber: value.phoneNumber,
          email: value.email

        }).then((docResponse) => {
          console.log(docResponse);
          this.messageService.add({severity: 'success', summary: 'Success',  detail: 'User created.'});
          setTimeout(() => {
            this.router.navigate(['/app/users/view']);
          }, 1000);
        }).catch((docErr) => {
          console.log(docErr);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: data.err
          });
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: data.err.message
        });
      }
    }, (err) => {
      console.log(err);
    });
      /*this.authService.registerProfile(value).then((response) => {
        console.log(response);


      }).catch((registrationErr) => {
        console.log(registrationErr);
      });*/
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
    this.uploadPercent = task.percentageChanges().pipe(
      map(percent => {
        return percent / 100;
      })
    );
    task.catch(err => console.log(err));
    // get notified when the download URL is available
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = ref.getDownloadURL();
          ref.getDownloadURL().subscribe(res => {
            self.form.controls['photoURL'].setValue(res);
          });
        })
      )
      .subscribe();
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
  checkPasswords(group: FormGroup) {
    // here we have the 'passwords' group
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notSame: true };
  }
  phoneNumberValidator(control: AbstractControl): { [key: string]: any } | null {
    const valid = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(control.value);
    return valid ? null : { invalidNumber: { valid: false, value: control.value } };
}
}
