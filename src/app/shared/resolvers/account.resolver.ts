import { ResolveFn } from '@angular/router';
import { AccountsService } from '../services/accounts.service';
import { inject } from '@angular/core';
export const accountResolver: ResolveFn<boolean> = (route, state) => {
  const accountService = inject(AccountsService);
  if (!accountService.hasAccounts()) {
    accountService.fetchAccounts();
  }
  return true;
};
