import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, User, signInWithEmailAndPassword, sendEmailVerification } from "@angular/fire/auth"
import { from, Observable } from 'rxjs';
import { Firestore, collection, docData, setDoc, doc} from '@angular/fire/firestore';

@Injectable({
	providedIn: 'root'
})

export class AuthorisationService {
	user: User | null = null;	
	constructor(private auth: Auth, private fA: Auth, private fs: Firestore) {
		this.auth.onAuthStateChanged(user => {
			if(user) {
				this.user = user;
			}
		});
	}

	addUser(userDetails: User, email: string, password: string) {
		return createUserWithEmailAndPassword(this.auth, email, password).then(cred => {
			return setDoc(doc(collection(this.fs, 'users') ,cred.user.uid), userDetails)
		});
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
	getDetails(){
		const docReference = doc(this.fs, `users/${this.user?.uid}`);
		return docData(docReference)
	}
}