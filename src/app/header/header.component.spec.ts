import { HeaderComponent } from './header.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { AuthorisationService } from '../authorisation.service';
import { AppModule } from '../app.module';

class MockAuthorisationService {
  user = null;
}

describe('When Header Component not logged in', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports:[AppModule],
      providers: [
        HeaderComponent, {provide: AuthorisationService, useClass: MockAuthorisationService}
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


});
