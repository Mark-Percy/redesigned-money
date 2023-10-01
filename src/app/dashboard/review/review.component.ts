import { Component, Input } from '@angular/core';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { TransactionsService } from 'src/app/shared/transactions.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent {

  displayedCols: string[] = ['Month', 'Amount']
  yearAmounts: Observable<DocumentData[]>
  @Input() currDate = new Date();
  constructor(private transactionService: TransactionsService) {
    this.yearAmounts = this.transactionService.getYearAmounts(this.currDate.getFullYear())
  }
}
