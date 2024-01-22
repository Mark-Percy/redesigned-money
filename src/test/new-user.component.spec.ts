import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserComponent } from '../app/authorisation/new-user/new-user.component';
import { AuthorisationService } from 'src/app/authorisation.service';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

describe('NewUserComponent', () => {
  let component: NewUserComponent;
  let fixture: ComponentFixture<NewUserComponent>;
  let MockAuthService: Partial<AuthorisationService>

  beforeEach(async () => {

    MockAuthService = {

    }
    
    await TestBed.configureTestingModule({
      declarations: [ NewUserComponent ],
      imports: [
        MatTabsModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        {provide: AuthorisationService, useValue: MockAuthService}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
