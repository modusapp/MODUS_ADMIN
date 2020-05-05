import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, map, tap, flatMap } from 'rxjs/operators';

@Injectable()
export class AuthguardService {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.auth.user
      .pipe(
        take(1),
        flatMap(user => {
          if (!!user) {
            return this.hasClaims(user);
          } else {
            return Promise.resolve(false);
          }
        })
      )
      .pipe(
        tap(canAccess => {
          if (!canAccess) {
            this.router.navigate(['/login']);
          } else {
            console.log(next, state);
          }
        })
      );
  }

  hasClaims(user: firebase.User) {
    return new Promise<boolean>((resolve, reject) => {
      user.getIdTokenResult().then(idTokenResult => {
        resolve(idTokenResult.claims.employee);
      });
    });
  }
}
