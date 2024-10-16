import { ResolveFn } from '@angular/router';
import { AccountsServiceV2 } from '../shared/services/accounts.service';
import { inject } from '@angular/core';
export const dashboardResolver: ResolveFn<boolean> = (route, state) => {
  const accountService = inject(AccountsServiceV2);
  if (!accountService.hasAccounts()) {
    accountService.fetchAccounts();
  }
  return true;
};
