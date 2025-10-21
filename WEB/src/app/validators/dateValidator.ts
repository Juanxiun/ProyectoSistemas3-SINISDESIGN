import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function dateNotInFutureValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        const inputDate = new Date(control.value);
        const today = new Date();

        inputDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (inputDate > today) {
            return { 'dateInFuture': true, 'requiredDate': today.toISOString().substring(0, 10) };
        }

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        if (inputDate < sevenDaysAgo) {
            return { 'date7days': true, 'requiredDate': sevenDaysAgo.toISOString().substring(0, 10) };
        }
        return null;
    };
}