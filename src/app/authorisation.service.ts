import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, sendEmailVerification, User } from "firebase/auth";
import { Auth, authState, createUserWithEmailAndPassword } from "@angular/fire/auth"
import { from, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
	providedIn: 'root'
})

export class AuthorisationService {
	currentUser$ = authState(this.auth);
	user: User | null = null;
	userCollection: AngularFirestoreCollection | undefined;
	
	constructor(private auth: Auth, private firebaseAuth: AngularFireAuth, private AngularFireStore: AngularFirestore) {
		this.auth.onAuthStateChanged(user => {
			if(user) {
				this.user = user;
			}
		});
	}

	addUser(email: string, password: string) {
		return from(createUserWithEmailAndPassword(this.auth, email, password));
	}

	signOut(): Observable<void> {
		this.user = null;
		return from(this.auth.signOut());
	}

	signIn(email:string, password: string){
		return from(signInWithEmailAndPassword(this.auth, email, password));
	}

	sendEmailVerification() {
		if(this.user){
			sendEmailVerification(this.user);
		}
	}

	addUserDetails(userDetails: {firstname: string, surname: string, email: string, id: string}) {
		this.userCollection = this.AngularFireStore.collection('users');
		this.userCollection.add(userDetails);
	}
}