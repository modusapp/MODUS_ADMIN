import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestore
} from '@angular/fire/firestore';
import { AdminProfile } from '../../interfaces/models';
import { Observable, Subscription } from 'rxjs';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/storage';
import { map, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {

  private userCollection: AngularFirestoreCollection<AdminProfile>;
  public users: Observable<AdminProfile[]>;

  public form: FormGroup;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  routeSub: Subscription;
  formReady: boolean = false;

  fieldId: any;
  user: AdminProfile;
  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userCollection = this.afs.collection<AdminProfile>('admin_profiles');
    this.routeSub = this.activeRoute.params.subscribe(params => {
      console.log(params);
      this.fieldId = params.id;
      this.userCollection
        .doc(params.id)
        .ref.get()
        .then(doc => {
          this.user = doc.data() as AdminProfile;
          console.log(this.user);
          this.form = this.fb.group(
            {
              email: [
                this.user.email,
                Validators.compose([Validators.required, Validators.email])
              ],
              firstName: [this.user.firstName, Validators.required],
              lastName: [this.user.lastName, Validators.required],
              phoneNumber: [this.user.phoneNumber],
              admin: [this.user.admin],
              photoURL: [this.user.photoURL]
            }
          );
          this.formReady = true;
        });
    });
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
    this.authService.updateProfile(this.fieldId, value).subscribe((data) => {
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
          this.messageService.add({severity: 'success', summary: 'Success',  detail: 'User updated.'});
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
  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
  phoneNumberValidator(control: AbstractControl): { [key: string]: any } | null {
    const valid = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(control.value);
    return valid ? null : { invalidNumber: { valid: false, value: control.value } };
}
}
