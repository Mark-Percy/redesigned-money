// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { LoginComponent } from './login.component';
// import { AuthorisationService } from 'src/app/shared/services/authorisation.service';
// import { IdTokenResult, User, UserCredential } from '@angular/fire/auth';
// import { Router } from '@angular/router';

// let MockToken: IdTokenResult = { claims: {} } as any;

// let user: User = {
//     uid: 'testUid',
//     emailVerified: true,
//     isAnonymous: false,
//     metadata: {},
//     providerData: [],
//     refreshToken: 'mockToken',
//     tenantId: null,
//     delete: async() => {},
//     getIdToken: async() =>{return 'Mock Token'},
//     getIdTokenResult: async() =>{return MockToken}, // MockToken is already initialized
//     reload: async() => {},
//     toJSON: () => ({}),
//     displayName: null,
//     email: null,
//     phoneNumber: null,
//     providerId: '',
//     photoURL: ''
// };

// let mockUserCredential: UserCredential = {
//     user: user,
//     providerId: '',
//     operationType: 'signIn'
// };

// const AuthServiceStub: Partial<AuthorisationService> = {
//     signIn: () => Promise.resolve(mockUserCredential),
// };

// const routerStub: Partial<Router> = {
//     navigate: () => Promise.resolve(true),
// };

// describe('LoginComponent', () => {
// 	let component: LoginComponent;
// 	let fixture: ComponentFixture<LoginComponent>;

// 	let authService: AuthorisationService;
// 	let router: Router;

// 	let email: string
// 	let password: string
	
// 	beforeEach(async () => {	
// 		await TestBed.configureTestingModule({
// 		imports: [LoginComponent],
// 		providers: [
// 			{ provide: AuthorisationService, useValue: AuthServiceStub },
// 			{ provide: Router, useValue: routerStub },
// 		]
// }).compileComponents();

// 	fixture = TestBed.createComponent(LoginComponent);
// 	component = fixture.componentInstance;
	
// 	authService = TestBed.inject(AuthorisationService);
// 	router = TestBed.inject(Router);

// 	spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
// 	spyOn(authService, 'signIn').and.returnValue(Promise.resolve(mockUserCredential))

// 	fixture.detectChanges();
// });


// 	it('should create', () => {
// 		expect(component).toBeTruthy();
// 	});


// 	it('Disallows Login', () => {
// 		component.signIn()
// 		expect(authService.signIn).not.toHaveBeenCalled()
// 	})

// 	it('Allows Login', async () => {
// 		email = 'test@test.com';
// 		password = 'Password123';
// 		component.signInForm.get('email')?.patchValue(email)
// 		component.signInForm.get('password')?.patchValue(password)
// 		component.signIn()
// 		await fixture.whenStable()
// 		expect(authService.signIn).toHaveBeenCalledWith(email, password)
// 		expect(router.navigate).toHaveBeenCalledWith(['dashboard']);
// 	})
// });