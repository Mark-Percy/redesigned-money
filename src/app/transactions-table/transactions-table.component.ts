import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTransactionComponent, FormPrefill } from '../add-transaction/add-transaction.component';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.css']
})
export class TransactionsTableComponent {

  @Input() dataSource!: CdkTableDataSourceInput<any>;

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor(private dialog: MatDialog) { }

  openEditDialog(row: any) {
    row.date = row.transactionDate.toDate();
    this.dialog.open(AddTransactionComponent, {data: {row: row}})
  }

}