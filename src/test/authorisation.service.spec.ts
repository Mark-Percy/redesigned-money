import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';

import { AuthorisationService } from '../app/authorisation.service';
import { MockUser } from './mockUser.interface';

fdescribe('AuthorisationService', () => {
  let service: AuthorisationService;

  const authState: MockUser = {
    displayName: null,
    email: null,
    uid: '17WvU2Vj58SnTz8v7EqyYYb0WRc2'
  };
  const mockAngularFireAuth: any = {
    auth: jasmine.createSpyObj('auth', {
      "signInWithEmailAndPassword": Promise.reject({
        code: "disallowed"
      }),
      "onAuthStateChanged": Promise.reject()
    })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {}
      ]
    });
    service = TestBed.inject(AuthorisationService);
    
    
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
