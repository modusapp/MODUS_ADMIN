import { MessageService } from 'primeng/components/common/messageservice';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, BehaviorSubject, ReplaySubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Http, Headers } from '@angular/http';
import { AdminProfile } from '../interfaces/models';
import { FirebaseApp } from '@angular/fire';

interface User {
  uid: string;
  email?: string | null;
  photoURL?: string;
  displayName?: string;
}

@Injectable()
export class AuthService {
  public user: Observable<firebase.User | null>;
  authState: any;
  userInfo: User;
  profile: ReplaySubject<AdminProfile> = new ReplaySubject(null);
  profileInfo: AdminProfile;

  constructor(
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private messageService: MessageService,
    private fns: AngularFireFunctions,
    private http: Http
  ) {

    this.afAuth.authState
      .pipe(
        switchMap(auth => {
          if (auth) {
            /// signed in
            return this.afs
              .collection('admin_profiles')
              .doc(auth.uid)
              .ref.get();
          } else {
            /// not signed in
            return of(null);
          }
        })
      )
      .subscribe(auth => {
        this.authState = auth;
        setTimeout(() => {
          if (auth) {
            this.profile.next(auth.data());
            this.profileInfo = auth.data();
          } else {
            this.profile.next(undefined);
          }
        }, 500);
      });
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          this.userInfo = {
            uid: user.uid,
            email: user.email,
            photoURL: user.photoURL,
            displayName: user.displayName
          };
          console.log(this.user);
          setTimeout(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Service Message',
              detail: 'welcome ' + this.userInfo.email
            });
          }, 3);
          return this.afAuth.authState; // modify to return observable array [authstate,idtoken]
        } else {
          return of(null);
        }
      })

      // tap(user => localStorage.setItem('user', JSON.stringify(user))),
      // startWith(JSON.parse(localStorage.getItem('user')))
    );
  }

  public login(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }
  public logout() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  registerProfile(user) {
    const url = 'https://us-central1-coffessions-server.cloudfunctions.net/registerUser';
    const request = this.http
      .post(url, { user: user })
      .pipe(map(res => res.json()));
    return request;
  }
  updateProfile(uid, user) {
    const url = 'https://us-central1-coffessions-server.cloudfunctions.net/updateUser';
    const request = this.http
      .post(url, { uid: uid, user: user })
      .pipe(map(res => res.json()));
    return request;
  }
  deleteProfile(uid) {
    const url = 'https://us-central1-coffessions-server.cloudfunctions.net/deleteUser';
    const request = this.http
      .post(url, { uid: uid })
      .pipe(map(res => res.json()));
    return request;
  }
}
