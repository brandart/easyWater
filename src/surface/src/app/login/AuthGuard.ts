import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(): boolean {
        const loggedIn = localStorage.getItem('loggedIn') === '1';

        if (!loggedIn) {
            this.router.navigateByUrl('/login');
        } else {
            return loggedIn;
        }
    }
}
