import { Routes } from '@angular/router';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';
import { NewUserComponent } from './authorisation/new-user/new-user.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {
  AngularFireAuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';
import { ProfileComponent } from './user/profile/profile.component';
import { TransactionsViewComponent } from './transactions-view/transactions-view.component';
import { accountCreationGuard } from './authorisation.service';
import { accountResolver } from './shared/resolvers/account.resolver';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['account', 'login']);
const redirectAuthorisedToDashboard = () => redirectLoggedInTo(['dashboard']);

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectAuthorisedToDashboard },
  },
  {
    path: 'account',
    component: AuthorisationComponent,
    children: [
      { path: 'login', component: LoginComponent },
      {
        path: 'new-user',
        component: NewUserComponent,
        canActivate: [accountCreationGuard],
      },
    ],
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AngularFireAuthGuard],
    resolve: { data: accountResolver },
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    children: [{ path: 'profile', component: ProfileComponent }],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    resolve: { data: accountResolver },
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'transactions',
    component: TransactionsViewComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
];
