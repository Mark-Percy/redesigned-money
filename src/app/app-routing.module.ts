import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';
import { NewUserComponent } from './authorisation/new-user/new-user.component';
import { VerifyUserComponent } from './user/verify-user/verify-user.component';
import { HomeComponent } from './home/home.component';
import { AuthGuardService } from './auth-guard.service';
import { UserComponent } from './user/user.component';
import { DasboardComponent } from './user/dasboard/dasboard.component';
import { verify } from 'crypto';
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
  {
    path:'user',
    component:UserComponent,
    canActivate:[AuthGuardService],
    children:[
      {path:'dashboard', component:DasboardComponent},
      {path:'verify', component:VerifyUserComponent}
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
