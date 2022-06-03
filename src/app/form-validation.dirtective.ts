import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatch: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const password: AbstractControl | null = formGroup.get('password');
    const confirmPassword: AbstractControl | null = formGroup.get('confirmPassword');
    return password && confirmPassword && password.value == confirmPassword.value ? null : { passwordMatch: true };
};