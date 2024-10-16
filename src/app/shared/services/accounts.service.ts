import { Injectable } from '@angular/core';
import {
  collection,
  Firestore,
  collectionData,
  DocumentData,
} from '@angular/fire/firestore';
import { BehaviorSubject, map, take } from 'rxjs';
import { AuthorisationService } from 'src/app/authorisation.service';
import { Account } from 'src/app/user/account/account.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountsServiceV2 {
  private _accounts: Account[] = [];
  public accounts$: BehaviorSubject<Account[]> = new BehaviorSubject<Account[]>(
    [],
  );

  constructor(
    private fireStore: Firestore,
    private auth: AuthorisationService,
  ) {
    //
  }

  // Retrieve accounts from firebase and assign to local data
  public fetchAccounts(): void {
    const accountsCollection = collection(
      this.fireStore,
      'users/' + this.auth.getUserId() + '/Accounts',
    );

    collectionData(accountsCollection)
      .pipe(
        take(1),
        map((accounts: DocumentData | (DocumentData & {})) => {
          let returnedAccounts: Account[] = [];
          accounts.forEach((account: Account) => {
            returnedAccounts.push(account);
          });
          return returnedAccounts;
        }),
      )
      .subscribe((accounts: Account[]) => {
        this.setAccountsSubject(accounts);
      });
  }

  // Check if the account data has been fetched from firebase
  public hasAccounts(): boolean {
    return !!this._accounts.length;
  }

  // Set the local account variable and observable
  private setAccountsSubject(accounts: Account[]): void {
    this._accounts = accounts;
    this.accounts$.next(this._accounts);
  }
}
