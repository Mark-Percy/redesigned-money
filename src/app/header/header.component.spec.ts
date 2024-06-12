import { HeaderComponent } from './header.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { AuthorisationService } from '../authorisation.service';

class MockUnAuthService {
  user = null;
}
class MockAuthService {
  user = {name:'test User'};
}

describe('When user is logged in', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let loader: HarnessLoader;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [HeaderComponent],
    providers: [
        HeaderComponent, { provide: AuthorisationService, useClass: MockAuthService }
    ]
})
    .compileComponents();
  })
  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should be logged in', () => {
    expect(component.isLoggedIn()).toBe(true) 
  })
})

describe('When Header Component not logged in', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [HeaderComponent],
    providers: [
        HeaderComponent, { provide: AuthorisationService, useClass: MockUnAuthService }
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be logged in', () => {
    expect(component.isLoggedIn()).toBe(false) 
  })
});
