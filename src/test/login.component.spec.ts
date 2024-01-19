import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from '../app/authorisation/login/login.component';
import { AuthorisationService } from 'src/app/authorisation.service';
import { Observable } from 'rxjs';
import { IdTokenResult, User, UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let AuthServiceStub: Partial<AuthorisationService>;
  let routerStub: Partial<Router>;
  let authService: AuthorisationService;
  let router: Router;

  let mockUserCredential: UserCredential;
  let user: User;
  let MockToken: IdTokenResult

  let email: string
  let password: string


  beforeEach(async () => {

    user = {
      uid: 'testUid',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: 'mockToken',
      tenantId: null,
      delete: async() => {},
      getIdToken: async() =>{return 'Mock Token'},
      getIdTokenResult: async() =>{return MockToken},
      reload: async() => {},
      toJSON: async() => {},
      displayName: null,
      email: null,
      phoneNumber: null,
      providerId: '',
      photoURL: ''
    }
    mockUserCredential = {
      user: user,
      providerId: '',
      operationType: 'signIn'
    }

    AuthServiceStub = {
      signIn: () => {
        return Promise.resolve(mockUserCredential)
      }
    }

    routerStub = {
      navigate: () => Promise.resolve(true)
    }
    

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      providers: [
        {provide: AuthorisationService, useValue: AuthServiceStub},
        {provide: Router, useValue: routerStub},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    authService = TestBed.inject(AuthorisationService);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
    spyOn(authService, 'signIn').and.returnValue(Promise.resolve(mockUserCredential))

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('Disallows Login', () => {
    component.signIn()
    expect(authService.signIn).not.toHaveBeenCalled()
  })

  it('Allows Login', async () => {
    email = 'test@test.com';
    password = 'Password123';
    component.signInForm.get('email')?.patchValue(email)
    component.signInForm.get('password')?.patchValue(password)
    component.signIn()
    await fixture.whenStable()
    expect(authService.signIn).toHaveBeenCalledWith(email, password)
    expect(router.navigate).toHaveBeenCalledWith(['dashboard']);
  })
});