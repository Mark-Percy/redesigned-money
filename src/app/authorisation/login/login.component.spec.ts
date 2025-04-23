import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthorisationService } from 'src/app/shared/services/authorisation.service';
import { IdTokenResult, User, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';


let MockToken: IdTokenResult = { claims: {} } as any;

let user: User = {
    uid: 'testUid',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: 'mockToken',
    tenantId: null,
    delete: async() => {},
    getIdToken: async() =>{return 'Mock Token'},
    getIdTokenResult: async() =>{return MockToken}, // MockToken is already initialized
    reload: async() => {},
    toJSON: () => ({}),
    displayName: null,
    email: null,
    phoneNumber: null,
    providerId: '',
    photoURL: ''
};

let mockUserCredential: UserCredential = {
    user: user,
    providerId: '',
    operationType: 'signIn'
};

const testEmail: string = 'test@example.com';
const testPassword: string = 'testPassword';

const AuthServiceStub: Partial<AuthorisationService> = {
    signIn: () => Promise.resolve(mockUserCredential),
};

const routerStub: Partial<Router> = {
    navigate: () => Promise.resolve(true),
};

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;

	let authService: jasmine.SpyObj<AuthorisationService>;
	let router: Router;
	
	beforeEach(async () => {	
		const authServiceSpy = jasmine.createSpyObj('AuthorisationService', ['signIn']);
		await TestBed.configureTestingModule({
		imports: [
			NoopAnimationsModule,
			ReactiveFormsModule,
			MatFormFieldModule,
			MatInputModule,
			MatButtonModule,
		],
		providers: [
			{ provide: AuthorisationService, useValue: AuthServiceStub },
			{ provide: Router, useValue: routerStub },
		]
	}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		
		authService = TestBed.inject(AuthorisationService) as jasmine.SpyObj<AuthorisationService>;
		router = TestBed.inject(Router);

		spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
		spyOn(authService, 'signIn').and.returnValue(Promise.resolve(mockUserCredential))

		fixture.detectChanges();
	});

	// General creation
	it('should create', () => {
		expect(component).toBeTruthy();
	});
	
	it('should create with empty form', () => {
		expect(component).toBeTruthy();
		expect(component.signInForm.value.email).toBe('');
		expect(component.signInForm.value.password).toBe('');
	});

	// Email validation
	it('should mark email control as invalid if email is missing', () => {
		const emailFormControl = component.signInForm.get('email');
		emailFormControl?.setValue('');
		expect(emailFormControl?.invalid).toBeTruthy();
		expect(emailFormControl?.errors?.['required']).toBeTruthy();
	});

	it('should mark email as invalid if email format is incorrect', () => {
		const invalidEmails = ['test', 'test@', '@example.com', 'test@.com', 'test@example..com', ' example@test.com '];
		const emailFormControl = component.signInForm.get('email');
		invalidEmails.forEach((invalidEmail) => {
			emailFormControl?.setValue(invalidEmail);
			expect(emailFormControl?.invalid).toBeTruthy();
			expect(emailFormControl?.errors?.['email']).toBeTruthy();
		});
	});

	it('should mark email as valid for valid emails', () => {
		const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user123@sub.domain.info', 'TEST@EXAMPLE.COM'];
		const emailFormControl = component.signInForm.get('email');
		validEmails.forEach((validEmail) => {
			emailFormControl?.setValue(validEmail);
			expect(emailFormControl?.valid).toBeTrue();
		});
	});

	// Password validation
	it('should mark password as invalid if empty', () => {
		const passwordFormControl = component.signInForm.get('password');
		passwordFormControl?.setValue('');
		expect(passwordFormControl?.invalid).toBeTrue();
		expect(passwordFormControl?.errors?.['required']).toBeTrue();
	});

	it('should mark password as valid if not empty', () => {
		const passwordFormControl = component.signInForm.get('password');
		passwordFormControl?.setValue('testPassword');
		expect(passwordFormControl?.valid).toBeTrue();
	});

	// Form validity tests
	it('should mark form as invalid if email or password are invalid', () => {
		const emailFormControl = component.signInForm.get('email');
		const passwordFormControl = component.signInForm.get('password');
		emailFormControl?.setValue('testexample.com');
		passwordFormControl?.setValue('');
		expect(component.signInForm.invalid).toBeTrue()
	});

	//UI interaction
	it('should mark form as valid if both email and password are valid', () => {
		const emailFormControl = component.signInForm.get('email');
		const passwordFormControl = component.signInForm.get('password');
		emailFormControl?.setValue(testEmail);
		passwordFormControl?.setValue('testPassword');
		expect(component.signInForm.valid).toBeTrue()
	});

	it('should update email control value on typing in email input with valid email', () => {
		const emailInput = fixture.debugElement.query(By.css('input[type="text"]')).nativeElement;
		const emailFormControl = component.signInForm.get('email');
		emailInput.value = testEmail;
		emailInput.dispatchEvent(new Event('input'));

		expect(emailFormControl?.value).toBe(testEmail);
		expect(emailFormControl?.valid).toBeTrue();
	});
	
	it('should update password control value on typing in password input with valid password', () => {
		const passwordInput = fixture.debugElement.query(By.css('input[type="password"]')).nativeElement;
		const passwordFormControl = component.signInForm.get('password');
		passwordInput.value = testPassword;
		passwordInput.dispatchEvent(new Event('input'));

		expect(passwordFormControl?.value).toBe(testPassword);
		expect(passwordFormControl?.valid).toBeTrue();
	});
	
	it('should update email and password control value on typing in email and password input with valid email,password', () => {
		// Email setup
		const emailInput = fixture.debugElement.query(By.css('input[type="text"]')).nativeElement;
		const emailFormControl = component.signInForm.get('email');
		emailInput.value = testEmail;
		emailInput.dispatchEvent(new Event('input'));
		
		// Password setup
		const passwordInput = fixture.debugElement.query(By.css('input[type="password"]')).nativeElement;
		const passwordFormControl = component.signInForm.get('password');
		passwordInput.value = testPassword;
		passwordInput.dispatchEvent(new Event('input'));

		
		expect(emailFormControl?.value).toBe(testEmail);
		expect(emailFormControl?.valid).toBeTrue();
		expect(passwordFormControl?.value).toBe(testPassword);
		expect(passwordFormControl?.valid).toBeTrue();
		expect(component.signInForm.valid).toBeTrue();
	});

	// Test Login after button clicked
	it('should not process login if form is invalid', async () => {
		const emailFormControl = component.signInForm.get('email');
		const passwordFormControl = component.signInForm.get('password');
		emailFormControl?.setValue('testexample.com');
		passwordFormControl?.setValue('');
		const signInButton = fixture.debugElement.query((By.css('button[type="submit"]'))).nativeElement;
		signInButton.click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(component.signInForm.invalid).toBeTrue();
		expect(authService.signIn).not.toHaveBeenCalled();
	});

	it('should process login if form is valid', async () => {
		const emailFormControl = component.signInForm.get('email');
		const passwordFormControl = component.signInForm.get('password');
		emailFormControl?.setValue(testEmail);
		passwordFormControl?.setValue(testPassword);
		const signInButton = fixture.debugElement.query((By.css('button[type="submit"]'))).nativeElement;
		signInButton.click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(component.signInForm.valid).toBeTrue();
		expect(authService.signIn).toHaveBeenCalledWith(testEmail, testPassword);
		expect(router.navigate).toHaveBeenCalledWith(['dashboard']);
	});

	// Test error for login from backend
	it('should not progress if error from backend', async () => {
		const errorMessage = 'Error Logging in';
		authService.signIn.and.returnValue(Promise.reject({message: errorMessage}));

		const emailFormControl = component.signInForm.get('email');
		const passwordFormControl = component.signInForm.get('password');
		emailFormControl?.setValue(testEmail);
		passwordFormControl?.setValue(testPassword);

		const signInButton = fixture.debugElement.query((By.css('button[type="submit"]'))).nativeElement;
		signInButton.click();
		fixture.detectChanges();
		await fixture.whenStable();

		expect(component.signInForm.valid).toBeTrue();
		expect(authService.signIn).toHaveBeenCalledWith(testEmail, testPassword);
		expect(router.navigate).not.toHaveBeenCalledWith(['dashboard']);
	})

});