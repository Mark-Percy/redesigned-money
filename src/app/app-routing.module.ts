import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorisationComponent } from './authorisation/authorisation.component';
import { LoginComponent } from './authorisation/login/login.component';
import { NewUserComponent } from './authorisation/new-user/new-user.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { DasboardComponent } from './user/dasboard/dasboard.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { map, switchMap } from 'rxjs/operators';
import { of, pipe } from 'rxjs';
import { ProfileComponent } from './user/profile/profile.component';

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
      {path:'profile', component:ProfileComponent}
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }