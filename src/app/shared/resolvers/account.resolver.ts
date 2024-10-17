import { ResolveFn } from '@angular/router';
import { AccountsServiceV2 } from '../services/accounts.service';
import { inject } from '@angular/core';
export const accountResolver: ResolveFn<boolean> = (route, state) => {
  const accountService = inject(AccountsServiceV2);
  if (!accountService.hasAccounts()) {
    accountService.fetchAccounts();
  }
  return true;
};
