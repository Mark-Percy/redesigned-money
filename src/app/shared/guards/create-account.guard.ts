import { Injectable } from "@angular/core";
import { AuthorisationService } from "../services/authorisation.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

@Injectable({
	providedIn: 'root'
})
export class accountCreationGuard  {
	constructor(private authService: AuthorisationService) {}
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		return this.authService.getAccountCreationEnabled()
		  
	}
}