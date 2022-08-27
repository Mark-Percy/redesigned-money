import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Account } from './account.interface';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {

  @Input() account: Account | null = null;
  @Output() deleteTheAccount = new EventEmitter<string>();

  constructor() { }

  deleteAccount() {
    this.deleteTheAccount.emit(this.account?.id)
  }
}