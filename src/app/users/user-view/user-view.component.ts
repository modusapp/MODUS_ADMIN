import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AdminProfile } from '../../interfaces/models';
import { map } from 'rxjs/operators';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormArray,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {
  private profilesCollection: AngularFirestoreCollection<AdminProfile>;

  public profiles: Observable<AdminProfile[]>;
  constructor(
    private afs: AngularFirestore,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private auth: AngularFireAuth,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.profilesCollection = this.afs.collection<AdminProfile>(
      'admin_profiles'
    );
    this.profiles = this.profilesCollection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as AdminProfile;
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }
  deleteUser(profile) {
    console.log(profile);
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete ' +
        (profile.firstName + ' ' + profile.lastName) +
        '?',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Deleting user...'
        });
        this.authService.deleteProfile(profile.id).subscribe(response => {
          console.log(response);
          if (response.success) {
            this.profilesCollection
              .doc(profile.id)
              .ref.delete()
              .then(() => {
                this.messageService.add({
                  severity: 'info',
                  summary: 'Success',
                  detail: 'User deleted.'
                });
              })
              .catch(err => {
                console.log(err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail:
                    'Unable to delete at this time. Please try again later.'
                });
              });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unable to delete at this time. Please try again later.'
            });
          }
        });
      }
    });
  }
  getInitials(firstName: string, lastName: string) {
    const firstInitial = firstName.split('')[0];
    const lastInitial = lastName.split('')[0];
    return firstInitial + lastInitial;
  }
  resetPassword(user: AdminProfile) {
    this.auth.auth
      .sendPasswordResetEmail(user.email)
      .then(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'A password reset email has been sent to ' + user.email
        });
      })
      .catch(error => {
        console.log(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'error'
        });
      });
  }
}
