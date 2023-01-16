import { Component, Input, OnInit } from '@angular/core';
import { TransAccountService } from 'src/app/trans-account.service';

@Component({
  selector: 'app-spending-amounts',
  templateUrl: './spending-amounts.component.html'
})
export class SpendingAmountsComponent implements OnInit {
  amounts: AmountsData = {amount: 0, spending: 0, useless: 0, bills: {monthly: 0, annual: 0}};;
  monthlyAmount: number = 0;
  @Input('date') date: Date;

  constructor(private tras: TransAccountService) {
  }

  ngOnInit(): void {
    this.tras.getAmountForMonth(this.date).then((data) => {
      this.amounts = data
      console.log(data)
    })
  }

}

export interface AmountsData{
  amount: number;
  spending?: number;
  useless?: number;
  americanExpress?: number;
  zopa?: number;
  paypal?: number;
  bills?: {monthly: number, annual: number}
}
