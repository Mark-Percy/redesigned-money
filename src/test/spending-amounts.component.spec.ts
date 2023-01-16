import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendingAmountsComponent } from '../app/transactions-view/spending-amounts/spending-amounts.component';

describe('SpendingAmountsComponent', () => {
  let component: SpendingAmountsComponent;
  let fixture: ComponentFixture<SpendingAmountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpendingAmountsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendingAmountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
