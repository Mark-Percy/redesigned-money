import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalsComponent } from './totals.component';

describe('TotalsComponent', () => {
  let component: TotalsComponent;
  let fixture: ComponentFixture<TotalsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalsComponent]
    });
    fixture = TestBed.createComponent(TotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
