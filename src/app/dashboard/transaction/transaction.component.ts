import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AddTransactionComponent } from 'src/app/add-transaction/add-transaction.component';
import { TransactionsService } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

  dashboardOpen: boolean | null = null;
  currDate: Date = new Date();
  month = this.currDate.getMonth();
  year = this.currDate.getFullYear();
  @Input() panelWidth = '45vw';

  constructor(private dialog: MatDialog, private router:Router, private route: ActivatedRoute, private transactionService: TransactionsService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.dashboardOpen = params['addNewTransaction'];
      if(params['addNewTransaction'] == 1){
        this.dialog.open(AddTransactionComponent, {
          width: '500px'
        });
      }
    });
  }

  transactionDialog() {
    this.router.navigate([], {
      queryParams: {
        addNewTransaction: 1
      }
    });
  }
}