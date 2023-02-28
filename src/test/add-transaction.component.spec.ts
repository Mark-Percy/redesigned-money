import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionComponent } from '../app/add-transaction/add-transaction.component';

describe('AddTransactionComponent', () => {
  let component: AddTransactionComponent;
  let fixture: ComponentFixture<AddTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
