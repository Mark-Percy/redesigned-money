import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseConfig } from './firebase.config';

import { AngularFireAuth } from '@angular/fire/compat/auth'

@Injectable({
	providedIn: 'root'
})
export class AuthorisationService {
	fbAuth;
	user:any;
	constructor(
		private firebaseConfig: FirebaseConfig,
		private router:Router,
	) {
		this.fbAuth = getAuth(firebaseConfig.app)
		onAuthStateChanged(this.fbAuth, (user) => {
			if(user) {
				this.user = user
				localStorage.setItem('loggedIn', 'true')
			} else {
				localStorage.setItem('loggedIn', 'false')
			}
		})
	}

	addUser(email: string, password: string) {
		createUserWithEmailAndPassword(this.fbAuth, email, password).then((userCredential) => {
			this.router.navigate(['verify-user']);
			this.user = userCredential.user;
		});
	}

	isLoggedIn(): boolean{
		return (localStorage.getItem('loggedIn') == 'true' ? true : false)
	}

	signOut():void {
		this.fbAuth.signOut();
	}
	signIn(email:string, password: string){
		signInWithEmailAndPassword(this.fbAuth, email, password).then(userCredential => {
			this.user = userCredential.user
			console.log(userCredential.user?.email)
			this.router.navigate(['verify-user']);

		});
	}
}
