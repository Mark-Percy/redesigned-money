import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.css']
})
export class TransactionsTableComponent {

  @Input() dataSource!: CdkTableDataSourceInput<any>;
  @Output('openDialog') close: EventEmitter<any> = new EventEmitter<any>();

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor() { }

  openEditDialog(row: any) {
    row.date = row.transactionDate.toDate();
    this.close.emit({row:row})
  }

}