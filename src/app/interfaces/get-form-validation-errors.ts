import { AbstractControl, FormGroup, ValidationErrors, FormArray, FormControl } from '@angular/forms';

export interface AllValidationErrors {
  control_name: string;
  error_name: string;
  error_value: any;
}

export interface FormGroupControls {
  [key: string]: AbstractControl;
}

export function getFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
  let errors: AllValidationErrors[] = [];
  Object.keys(controls).forEach(key => {
    const control = controls[ key ];
    if (control instanceof FormGroup) {
      errors = errors.concat(getFormValidationErrors(control.controls));
    }
    const controlErrors: ValidationErrors = controls[ key ].errors;
    if (controlErrors !== null) {
      Object.keys(controlErrors).forEach(keyError => {
        errors.push({
          control_name: key,
          error_name: keyError,
          error_value: controlErrors[ keyError ]
        });
      });
    }
  });
  return errors;
}
export function setAsTouched(group: FormGroup | FormArray) {
  group.markAsTouched();
  for (const i in group.controls) {
    if (group.controls[i] instanceof FormControl) {
      group.controls[i].markAsTouched();
    } else {
      this.setAsTouched(group.controls[i]);
    }
   }
 }
