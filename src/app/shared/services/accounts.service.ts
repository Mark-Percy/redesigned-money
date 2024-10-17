import { Injectable } from '@angular/core';
import {
  collection,
  Firestore,
  collectionData,
  DocumentData,
  addDoc,
  deleteDoc,
  doc,
} from '@angular/fire/firestore';
import { BehaviorSubject, map, take } from 'rxjs';
import { AuthorisationService } from 'src/app/authorisation.service';
import { Account, DraftAccount } from 'src/app/user/account/account.interface';

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

  /* -------------------------------------------------------------------------- */
  /*                              Firebase Fetching                             */
  /* -------------------------------------------------------------------------- */
  // Retrieve accounts from firebase and assign to local data
  public fetchAccounts(): void {
    const accountsCollection = collection(
      this.fireStore,
      'users/' + this.auth.getUserId() + '/Accounts',
    );

    collectionData(accountsCollection, { idField: 'id' })
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

  /* -------------------------------------------------------------------------- */
  /*                                   Create                                   */
  /* -------------------------------------------------------------------------- */
  public addAccount(newAccount: DraftAccount): void {
    const accountsCollection = collection(
      this.fireStore,
      'users/' + this.auth.getUserId() + '/Accounts',
    );
    addDoc(accountsCollection, newAccount).then((response) => {
      // add to list of accounts
      const createdAccount: Account = { ...newAccount, id: response.id };
      let updatedAccountList: Account[] = [...this._accounts, createdAccount];
      this.setAccountsSubject(updatedAccountList);

      if (createdAccount.type === 'Savings') {
        this.addSavingsPot(createdAccount, 'Main', createdAccount.amount);
      }
    });
  }

  // Add a pot to an existing account
  public addSavingsPot(account: Account, name: string, amount: number): void {
    const potCollection = collection(
      this.fireStore,
      'users/' + this.auth.getUserId() + '/Accounts/' + account.id + '/pots',
    );
    addDoc(potCollection, { name: name, amount: amount ?? account.amount });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Read                                    */
  /* -------------------------------------------------------------------------- */
  public getAccount(accountId: string): Account | undefined {
    return this._accounts.find((account: Account) => account.id === accountId);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Update                                   */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                   Delete                                   */
  /* -------------------------------------------------------------------------- */
  public deleteAccount(accountId: string): void {
    const accountsCollection = collection(
      this.fireStore,
      'users/' + this.auth.getUserId() + '/Accounts',
    );
    deleteDoc(doc(accountsCollection, accountId)).then((response) => {
      let updatedAccountList = this._accounts.filter(
        (account: Account) => account.id !== accountId,
      );

      this.setAccountsSubject(updatedAccountList);
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                Miscellaneous                               */
  /* -------------------------------------------------------------------------- */
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
