import { FormControl, FormGroup } from '@angular/forms';
import { passwordMatch } from './password-match.validator';

describe('passwordMatch Validator', () => {
	let formGroup: FormGroup;

	beforeEach(() => {
		formGroup = new FormGroup({
			password: new FormControl(''),
			confirmPassword: new FormControl(''),
		});
	});

	it('should return null when passwords match', () => {
		formGroup.controls['password'].setValue('secret');
		formGroup.controls['confirmPassword'].setValue('secret');
		const errors = passwordMatch(formGroup);
		expect(errors).toBeNull();
	});

	it('should return passwordMatch error when passwords do not match', () => {
		formGroup.controls['password'].setValue('secret');
		formGroup.controls['confirmPassword'].setValue('different');
		const errors = passwordMatch(formGroup);
		expect(errors).toEqual({ passwordMatch: true });
	});

	it('should return passwordMatch error if either password or confirmPassword control is not present', () => {
		const incompleteFormGroup = new FormGroup({
			password: new FormControl('secret'),
		});
		const errors = passwordMatch(incompleteFormGroup);
		expect(errors).toEqual({ passwordMatch: true });
	});

	it('should handle empty password values correctly', () => {
		formGroup.controls['password'].setValue('');
		formGroup.controls['confirmPassword'].setValue('');
		const errors = passwordMatch(formGroup);
		expect(errors).toBeNull();
	});

	it('should handle cases with different casing', () => {
		formGroup.controls['password'].setValue('Secret');
		formGroup.controls['confirmPassword'].setValue('secret');
		const errors = passwordMatch(formGroup);
		expect(errors).toEqual({ passwordMatch: true }); // Assuming case-sensitive comparison
	});
});
