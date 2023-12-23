import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, User, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from "@angular/fire/auth"
import { from, Observable } from 'rxjs';
import { Firestore, collection, docData, setDoc, doc } from '@angular/fire/firestore';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { getDoc } from 'firebase/firestore';

@Injectable({
	providedIn: 'root'
})

export class AuthorisationService {
	user: User | null = null;	
	constructor(private auth: Auth, private fs: Firestore) {
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
	getUserId():string | null{
		if(!this.user) return null;
		return this.user.uid
	}
	hasDisplayName(): boolean {
		return this.user ? this.user.displayName ? true : false : false
	}
	updateDisplayName(displayName: any) {
		const user = this.auth.currentUser?.displayName;
		if(this.user) updateProfile(this.user, {displayName: displayName});
	}
	getAccountCreationEnabled(): Promise<boolean>{
		const appSettingsRef = doc(this.fs, "settings", "appsettings")
		const appSettings = getDoc(appSettingsRef)
		return appSettings.then((docSnap) => {
			return docSnap.get('accountCreationEnabled')
		})
	}
}

@Injectable({
  providedIn: 'root'
})
export class accountCreationGuard  {
	constructor(private authService: AuthorisationService) {}
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		return this.authService.getAccountCreationEnabled()
		
	}
}