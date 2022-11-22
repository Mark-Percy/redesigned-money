import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { TransAccountService } from '../trans-account.service';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.css']
})
export class TransactionsViewComponent implements OnInit, AfterViewInit {
  today: Date = new Date();
  date: FormControl = new FormControl(new Date())
  monthlyAmount: number = 0;

  transactions: Observable<DocumentData[]>;

  listener!:any;
  @ViewChild('transTable',{static:false}) scrollTableRef!: ElementRef;
  showHead: boolean = false;

  constructor(private tras: TransAccountService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router, private renderer2: Renderer2) {
    this.route.queryParams.subscribe(params => {
      this.date.value.setMonth(params['month'])
    });
    this.transactions = this.tras.getTransactionsForMonth(this.date.value)
    this.tras.getAmountForMonth(this.date.value).then((data) => {
      this.monthlyAmount = data
    })
    this.date.valueChanges.subscribe(value =>{
      this.router.navigate([], {
        queryParams: {month: value.getMonth()}
      })
      this.transactions = this.tras.getTransactionsForMonth(value);
      this.tras.getAmountForMonth(this.date.value).then((data) => {
        this.monthlyAmount = data
      })
    })
  }
  ngAfterViewInit(): void {
    console.log(this.scrollTableRef.nativeElement)
    this.listener = this.renderer2.listen(this.scrollTableRef.nativeElement, 'scroll', (e) => {
      this.showHead = this.scrollTableRef.nativeElement.scrollTop > 6;
    })
  }
  ngOnInit(): void {
    console.log(this.scrollTableRef)
  }

  addTransaction() {
    const addTransactionDialog = this.dialog.open(AddTransactionComponent, {data: {date:this.date.value}})
     addTransactionDialog.afterClosed().subscribe(() => {
      this.tras.getAmountForMonth(this.date.value).then((data) => {
        this.monthlyAmount = data
      })
    })
  }

  changeDate(numOfMonths: number) {
    const holderDate: Date = this.date.value
    holderDate.setMonth(this.date.value.getMonth() + numOfMonths);
    this.date.setValue(holderDate);

  }
  
  setMonthYear(value: Date, widget:any) {
    this.date.setValue(value);
    widget.close()
  }
  
}
