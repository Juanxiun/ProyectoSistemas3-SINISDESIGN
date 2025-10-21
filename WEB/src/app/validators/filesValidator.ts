import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';


export function filesValidator(): ValidatorFn {

    const forbidden = /[\\/:*?"<>|]/;

    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (!value) {
            return null;
        }

        if (forbidden.test(value)) {
            return {
                'forbiddenChars': true,
                'chars': '\\ / : * ? " < > |'
            };
        }

        return null;
    };
}