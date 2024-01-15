import { DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';

import { MaterialModule } from './module-libraries/material.module';
import { NewUserComponent } from './authorisation/new-user/new-user.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';

import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { UserComponent } from './user/user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { accountCreationGuard } from './authorisation.service';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { PersonalInfoComponent } from './user/personal-info/personal-info.component';
import { AddAccountDialog, ProfileComponent } from './user/profile/profile.component';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { AccountComponent } from './user/account/account.component';
import { TransactionComponent } from './dashboard/transaction/transaction.component';
import { TransactionsViewComponent, AmountsBottomSheet } from './transactions-view/transactions-view.component';
import { TransactionsTableComponent } from './transactions-table/transactions-table.component';
import { AddTransactionComponent } from './add-transaction/add-transaction.component';
import { SavingsComponent } from './dashboard/savings/savings.component';
import { SavingsDialogComponent } from './dashboard/savings/savings-dialog/savings-dialog.component';
import { BillsComponent } from './dashboard/bills/bills.component';
import { TotalsComponent } from './dashboard/totals/totals.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthorisationComponent,
    LoginComponent,
    NewUserComponent,
    HomeComponent,
    HeaderComponent,
    UserComponent,
    DashboardComponent,
    PersonalInfoComponent,
    ProfileComponent,
    AddAccountDialog,
    AccountComponent,
    TransactionComponent,
    TransactionsViewComponent,
    TransactionsTableComponent,
    AddTransactionComponent,
    SavingsComponent,
    SavingsDialogComponent,
    AmountsBottomSheet,
    BillsComponent,
    TotalsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [{provide:DEFAULT_CURRENCY_CODE, useValue: 'GBP'}, accountCreationGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
