import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.css']
})
export class TransactionsTableComponent implements OnInit {

  @Input() dataSource!: CdkTableDataSourceInput<any>;

  displayedColumns: string[] = ['transactionDate','amount', 'category', 'location'];

  constructor() { }

  ngOnInit(): void {
  }

}