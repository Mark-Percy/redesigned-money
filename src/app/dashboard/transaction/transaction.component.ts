import { Component, Input, OnInit } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { AddTransactionComponent } from 'src/app/add-transaction/add-transaction.component';
import { TransAccountService } from 'src/app/trans-account.service';
import { Account } from 'src/app/user/account/account.interface';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

  dashboardOpen: boolean | null = null;
  currDate: Date = new Date();
  month = this.currDate.getMonth();
  transactions: Observable<DocumentData[]> = this.tras.getTransactions(5);
  @Input() panelWidth = '45vw';

  constructor(private dialog: MatDialog, private router:Router, private route: ActivatedRoute, private tras: TransAccountService) {
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