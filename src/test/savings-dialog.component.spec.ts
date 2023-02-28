import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsDialogComponent } from '../app/dashboard/savings/savings-dialog/savings-dialog.component';

describe('SavingsDialogComponent', () => {
  let component: SavingsDialogComponent;
  let fixture: ComponentFixture<SavingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavingsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
