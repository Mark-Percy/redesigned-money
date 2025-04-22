import { Routes }												from '@angular/router';
import { AuthGuard, redirectLoggedInTo,redirectUnauthorizedTo }	from '@angular/fire/auth-guard';

import { AuthorisationComponent }		from './authorisation/authorisation.component';
import { accountCreationGuard }			from './shared/guards/create-account.guard';
import { accountResolver }				from './shared/resolvers/account.resolver';
import { DashboardComponent }			from './dashboard/dashboard.component';
import { HomeComponent }				from './home/home.component';
import { LoginComponent }				from './authorisation/login/login.component';
import { NewUserComponent }				from './authorisation/new-user/new-user.component';
import { ProfileComponent }				from './user/components/profile/profile.component';
import { TransactionsViewComponent} 	from './transactions-view/transactions-view.component';
import { UserComponent }				from './user/user.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['account', 'login']);
const redirectAuthorisedToDashboard = () => redirectLoggedInTo(['dashboard']);

export const routes: Routes = [
	{
		path: '',
		component: HomeComponent,
		canActivate: [AuthGuard],
		data: { authGuardPipe: redirectAuthorisedToDashboard },
  	},
  	{
		path: 'account',
		component: AuthorisationComponent,
		children: [
	  		{ path: 'login',component: LoginComponent },
	  		{ path: 'new-user',component: NewUserComponent,canActivate: [accountCreationGuard]},
		],
  	},
  	{
		path: 'user',
		component: UserComponent,
		canActivate: [AuthGuard],
		resolve: { data: accountResolver },
		data: { authGuardPipe: redirectUnauthorizedToLogin },
		children: [{ path: 'profile', component: ProfileComponent }],
  	},
  	{
		path: 'dashboard',
		component: DashboardComponent,
		resolve: { data: accountResolver },
		canActivate: [AuthGuard],
		data: { authGuardPipe: redirectUnauthorizedToLogin },
	},
	{
		path: 'transactions',
		component: TransactionsViewComponent,
		canActivate: [AuthGuard],
		resolve: {data: accountResolver},
		data: { authGuardPipe: redirectUnauthorizedToLogin },
	},
];
