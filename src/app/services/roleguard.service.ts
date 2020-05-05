import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';
import { AdminProfile } from '../interfaces/models';

@Injectable()
export class RoleguardService {

constructor(private auth: AuthService, private router: Router) {

 }
 canActivate(
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean {
  return this.auth.profile.pipe(
    take(1),
    map(user => {
      console.log(user);
     return user ? user.admin : false;
    }),
    tap(loggedIn => {
      if (!loggedIn) {
        console.log('is not admin');
        this.router.navigate(['/app/orders/view']);
      } else {
        console.log('is admin');
      }

    })
  );
}

}
