import { ResolveFn } from '@angular/router';
import { AccountsService } from '../services/accounts.service';
import { inject } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Account } from 'src/app/user/account/account.interface';
export const accountResolver: ResolveFn<Account[]> = (route, state): Observable<Account[]> => {
  const accountService = inject(AccountsService);
  if (!accountService.hasAccounts()) {
    accountService.fetchAccounts();
  }
  return accountService.accounts$.pipe(take(1));
};
