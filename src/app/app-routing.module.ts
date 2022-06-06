import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';
import { NewUserComponent } from './authorisation/new-user/new-user.component';
import { VerifyUserComponent } from './verify-user/verify-user.component';
import { HomeComponent } from './home/home.component';
import { AuthGuardService } from './auth-guard.service';
// import { AuthGuard } from './_guards/'
const routes: Routes = [
  {path: '', component: HomeComponent},
  {
    path: 'account',
    component:AuthorisationComponent, 
    children:[
      {path:'login',component:LoginComponent},
      {path:'new-user',component:NewUserComponent}
    ]
  },
  {path:'verify-user',component:VerifyUserComponent, canActivate:[AuthGuardService]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
