import { AuthService } from './../services/auth.service';
import { Component, HostBinding, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormArray,
  FormControl
} from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import {
  getFormValidationErrors,
  AllValidationErrors
} from './get-form-validation-errors';

@Component({
  selector: 'app-login',
  styleUrls: ['./login.style.scss'],
  templateUrl: './login.template.html'
})
export class LoginComponent implements OnInit {
  @HostBinding('class') classes = 'login-page app';
  loginForm: FormGroup;
  testSub: Subscription;
  constructor(
    public afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private messageService: MessageService,
    private auth: AuthService,
    public router: Router
  ) {}
  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    console.log(this.loginForm);
  }
  login(form: FormGroup) {
    const value = form.value;
    console.log(value);
    if (form.valid) {
      this.auth
        .login(value.email, value.password)
        .then(data => {
          console.log(data);
          this.router.navigate(['app/orders/view']);
        })
        .catch(err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
          });
        });
    } else {
      const error = this.handleErrors(form);
      setTimeout(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error,
          life: 3000
        });
      }, 500);

      console.log(form);
    }
  }
  handleErrors(form) {
    this.setAsTouched(form);
    const error: AllValidationErrors = getFormValidationErrors(
      form.controls
    ).shift();
    let formError = null;
    if (error) {
      let text;
      switch (error.error_name) {
        case 'required':
          text = `${error.control_name} is required`;
          break;
        case 'pattern':
          text = `${error.control_name} has wrong pattern`;
          break;
        case 'email':
          text = `${error.control_name} has wrong email format`;
          break;
        case 'minlength':
          text = `${error.control_name} has wrong length Required length: ${
            error.error_value.requiredLength
          }`;
          break;
        case 'areEqual':
          text = `${error.control_name} must be equal`;
          break;
        default:
          text = `${error.control_name}: ${error.error_name}: ${
            error.error_value
          }`;
      }
      formError = text;
      return formError;
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
}
