import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserComponent } from './new-user.component';
import { AuthorisationService } from 'src/app/shared/services/authorisation.service';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';

const AuthServiceStub: Partial<AuthorisationService> = {
	addUser: () => Promise.resolve(),
};

const routerStub: Partial<Router> = {
	navigate: () => Promise.resolve(true),
};

describe('NewUserComponent', () => {
	let component: NewUserComponent;
	let fixture: ComponentFixture<NewUserComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				MatTabsModule,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				MatIconModule,
				MatInputModule,
				NewUserComponent,
				MatFormFieldModule,
			],
			providers: [
				{ provide: AuthorisationService, useValue: AuthServiceStub },
				{ provide: Router, useValue: routerStub },
			]
		})
		.compileComponents();
	});

	beforeEach( async () => {
		fixture = TestBed.createComponent(NewUserComponent);
		component = fixture.componentInstance;
		fixture.detectChanges()
	});

	describe('general', () => {
		it('should create and form should be invalid', () => {
			expect(component).toBeTruthy();
			const userFormGroup = component.newAccountForm.get('userDetails');
			expect(userFormGroup?.invalid).toBeTrue();
		});
		
		it('should create with 1st tab shown', () => {
			expect(component.selectedTab).toBe(0);
			fixture.detectChanges();
			const tabContentContainer = fixture.debugElement.query(By.css('.mat-mdc-tab-group > .mat-mdc-tab-body-wrapper > .mat-mdc-tab-body:first-child .mat-mdc-tab-body-content'));
			
			if (tabContentContainer) {
				const inputs = tabContentContainer.queryAll(By.css('mat-form-field input'));
				const inputNames: string[] = inputs.map(input => input.nativeElement.getAttribute('name'));
				
				expect(inputNames).toContain('firstName');
				expect(inputNames).toContain('surname');
			} else {
				fail('Could not find the active tab content container.');
			}
		});
	});

	describe('changing tabs within new account form', () => {
		let buttons: DebugElement[];
		let nameField: AbstractControl<any, any> | null | undefined;
		let surnameField: AbstractControl<any, any> | null | undefined;
		beforeEach(async () => {
			buttons = fixture.debugElement.queryAll(By.css('button'))
			nameField = component.newAccountForm.get('userDetails')?.get('firstName');
			surnameField = component.newAccountForm.get('userDetails')?.get('surname');
		});

		it('should not switch tab if both first name and surname are empty', () => {
			const currTab = component.selectedTab;
			const nextButton = buttons.find(buttons => buttons.nativeElement.textContent == 'Next')?.nativeElement;
			expect(component.newAccountForm.get('userDetails')?.invalid).toBeTrue();
			if(nextButton) {
				nextButton.click();
			} else {
				fail('could not find next button');
			}
			expect(component.selectedTab).toBe(currTab);
		});

		it('should not switch tab if 1 of first name or surname is empty', () => {

			nameField?.setValue('Mark');

			expect(nameField?.valid).toBeTrue();
			expect(surnameField?.invalid).toBeTrue();
			
			const currTab = component.selectedTab
			const nextButton = buttons.find(buttons => buttons.nativeElement.textContent == 'Next')?.nativeElement;
			expect(component.newAccountForm.get('userDetails')?.invalid).toBeTrue();
			if(nextButton) {
				nextButton.click();
			} else {
				fail('could not find next button');
			}
			expect(component.selectedTab).toBe(currTab);
		});

		it('should allow to change tab when userDetails is valid', () => {
			nameField?.setValue('Mark');
			surnameField?.setValue('Percy');

			expect(nameField?.valid).toBeTrue();
			expect(surnameField?.valid).toBeTrue();
			
			const currTab = component.selectedTab
			const nextButton = buttons.find(buttons => buttons.nativeElement.textContent == 'Next')?.nativeElement;
			expect(component.newAccountForm.get('userDetails')?.valid).toBeTrue();
			if(nextButton) {
				nextButton.click();
			} else {
				fail('could not find next button');
			}
			expect(component.selectedTab).toBe(currTab+1);
		});

		it('should moves back to name details when back button is clicked', () => {
			component.selectedTab = 1;
			fixture.detectChanges();

			const backButton = fixture.debugElement.query(By.css('#back-button'))?.nativeElement;
			component.newAccountForm.get('userDetails')?.get('firstName')?.setValue('Mark');
			component.newAccountForm.get('userDetails')?.get('surname')?.setValue('Percy');
			
			if (backButton) {
				backButton.click();
				fixture.detectChanges();
				expect(component.selectedTab).toBe(0); // Assert we're back to the first tab
			} else {
				fail('Could not find the "Back" button.');
			}
		});
	});

	describe('interaction with the userDetails Section and enable moving onto next', () => {
		let inputs: DebugElement[];
		let buttons: DebugElement[];

		beforeEach(async () => {
			inputs = fixture.debugElement.queryAll(By.css('input'));
			buttons = fixture.debugElement.queryAll(By.css('button'))
		});
		
		it('should allow typing in first name and surname', () => {
			const names = ['Mark', 'Percy'];
			let num = 0;
			const nextButton = buttons.find(buttons => buttons.nativeElement.textContent == 'Next')?.nativeElement;
			const currTab = component.selectedTab
			inputs.forEach((input) => {
				const inputEl = input.nativeElement;
				expect(inputEl.name === 'firstName' || inputEl.name === 'surname').toBeTrue()
				inputEl.value = names[num];
				inputEl.dispatchEvent(new Event('input'));
				num ++;
			});
			fixture.detectChanges();
			expect(component.newAccountForm.get('userDetails')?.get('firstName')?.value).toBe('Mark');
			expect(component.newAccountForm.get('userDetails')?.get('surname')?.value).toBe('Percy');

			nextButton.click()
			expect(component.selectedTab).toBe(currTab+1)
		});
	});

	describe('account details validation', () => {
		let emailControl: AbstractControl|null|undefined;

		beforeEach(async () => {
			emailControl = component.newAccountForm.get('accountDetails')?.get('email');
		});

		it('should mark email as invalid with invalid email', () => {
			const invalidEmails = ['test', 'test@', '@example.com', 'test@.com', 'test@example..com', ' example@test.com '];
			const emailControl = component.newAccountForm.get('accountDetails')?.get('email');
			invalidEmails.forEach((invalidEmail) => {
				emailControl?.setValue(invalidEmail);
				expect(emailControl?.invalid).toBeTrue();
			});
		});

		it('should mark email as valid with valid email', () => {
			const validEmail = 'test@example.com';
			const emailControl = component.newAccountForm.get('accountDetails')?.get('email');
			emailControl?.setValue(validEmail);
			expect(emailControl?.valid).toBeTrue();
		});

		it('should mark passwords inputs as invalid if empty', () => {
			const passwordControl = component.newAccountForm.get('accountDetails')?.get('password');
			const password2Control = component.newAccountForm.get('accountDetails')?.get('confirmPassword');
			expect(passwordControl?.invalid).toBeTrue();
			expect(password2Control?.invalid).toBeTrue();
		});

		it('should mark form as invalid if both password and confirm do not match', () => {
			const validPassword = 'password';
			const passwordControl = component.newAccountForm.get('accountDetails')?.get('password');
			const password2Control = component.newAccountForm.get('accountDetails')?.get('confirmPassword');
			passwordControl?.setValue(validPassword);
			password2Control?.setValue('MissMatch');
			expect(passwordControl?.valid).toBeTrue();
			expect(password2Control?.valid).toBeTrue();
			expect(component.newAccountForm.get('accountDetails')?.invalid).toBeTrue();
		});
		
		it('should mark form as valid if both password and confirm do match', () => {
			const validPassword = 'password';
			const passwordControl = component.newAccountForm.get('accountDetails')?.get('password');
			const password2Control = component.newAccountForm.get('accountDetails')?.get('confirmPassword');
			passwordControl?.setValue(validPassword);
			password2Control?.setValue(validPassword);
			expect(passwordControl?.valid).toBeTrue();
			expect(password2Control?.valid).toBeTrue();
			expect(component.newAccountForm.get('accountDetails')?.invalid).toBeTrue();
		});
	});

	describe('Form submission', () => {
		let submitButton: DebugElement;
		let nameField: AbstractControl<any, any> | null | undefined;
		let surnameField: AbstractControl<any, any> | null | undefined;
		let emailField: AbstractControl<any, any> | null | undefined;
		let passwordField: AbstractControl<any, any> | null | undefined;
		let confirmPasswordField: AbstractControl<any, any> | null | undefined;
		let authService: jasmine.SpyObj<AuthorisationService>;
		let router: Router;


		beforeEach(async () => {
			fixture.detectChanges();

			authService = TestBed.inject(AuthorisationService) as jasmine.SpyObj<AuthorisationService>;
			router = TestBed.inject(Router);

			submitButton = fixture.debugElement.query(By.css('button[type=submit]'));

			nameField = component.newAccountForm.get('userDetails')?.get('firstName');
			surnameField = component.newAccountForm.get('userDetails')?.get('surname');
			emailField = component.newAccountForm.get('accountDetails')?.get('email');
			passwordField = component.newAccountForm.get('accountDetails')?.get('password');
			confirmPasswordField = component.newAccountForm.get('accountDetails')?.get('confirmPassword');
			spyOn(authService, 'addUser').and.returnValue(Promise.resolve())
			spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
			
		});

		it('should not allow submission of form if the form is invalid.', () => {

			nameField?.setValue('Mark');
			surnameField?.setValue('Percy');
			
			component.selectedTab = 1;
			
			fixture.detectChanges();
			submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
			submitButton.nativeElement.click();
			fixture.detectChanges();
			expect(component.newAccountForm.invalid).toBeTrue()
			expect(AuthServiceStub.addUser).not.toHaveBeenCalled();
			expect(routerStub.navigate).not.toHaveBeenCalled();
		});
		
		it('should allow submission of form if the form is valid.', async () => {
			nameField?.setValue('Mark');
			surnameField?.setValue('Percy');
			component.selectedTab = 1;
			fixture.detectChanges();
			emailField?.setValue('test@example.com');
			passwordField?.setValue('password');
			confirmPasswordField?.setValue('password');
			fixture.detectChanges();
			expect(component.newAccountForm.valid).toBeTrue()
			submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
			submitButton.nativeElement.click();
			
			await fixture.whenStable();

			expect(AuthServiceStub.addUser).toHaveBeenCalled();
			expect(routerStub.navigate).toHaveBeenCalled();

		});
	});
});
