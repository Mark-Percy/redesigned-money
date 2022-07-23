import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';
import { NewUserComponent } from './authorisation/new-user/new-user.component';
import { VerifyUserComponent } from './user/verify-user/verify-user.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { DasboardComponent } from './user/dasboard/dasboard.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { map, switchMap } from 'rxjs/operators';
import { of, pipe } from 'rxjs';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['account','login']);
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
    canActivate:[AngularFireAuthGuard], 
    data: {authGuardPipe: redirectUnauthorizedToLogin},
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