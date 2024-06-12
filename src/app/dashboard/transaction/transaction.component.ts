import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddTransactionComponent } from 'src/app/add-transaction/add-transaction.component';
import { TransactionsService } from 'src/app/shared/transactions.service';
import { TransactionsTableComponent } from '../../transactions-table/transactions-table.component';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css', '../dashboard_base.css'],
    standalone: true,
    imports: [
      NgStyle,
      MatAnchor,
      RouterLink,
      MatIconButton,
      MatIcon,
      TransactionsTableComponent
    ]
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