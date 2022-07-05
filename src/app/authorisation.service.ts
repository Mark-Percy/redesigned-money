import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, User } from "firebase/auth";
import { FirebaseConfig } from './firebase.config';

@Injectable()

export class AuthorisationService {
	fbAuth;
	isLoggedIn:boolean = false;
	user: any;
	constructor(
		private firebaseConfig: FirebaseConfig,
		private router:Router
	) {
		this.fbAuth = getAuth(this.firebaseConfig.app)
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
			this.router.navigate(['user']);
			this.isLoggedIn = true;
			// localStorage.setItem('user', JSON.stringify(userCredential.user))
			this.user = userCredential.user;
		});
	}

	getIsLoggedIn(): boolean{
		return this.isLoggedIn;
	}

	signOut():void {
		this.fbAuth.signOut();
	}
	signIn(email:string, password: string){
		signInWithEmailAndPassword(this.fbAuth, email, password).then(userCredential => {
			this.user = userCredential.user
			this.isLoggedIn = true;
			console.log(this.getIsLoggedIn())
			localStorage.setItem('user', JSON.stringify(userCredential.user))
			console.log("heelllo")
		}).then(() => {
			this.router.navigate(['user','dashboard']);
		});
	}

	sendEmailVerification() {
		sendEmailVerification(this.user).then( () => {
			console.log('email success')
		})
	}

	getIsVerified(): boolean{
		return true;
	}
}
