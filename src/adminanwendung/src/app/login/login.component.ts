import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CouchService } from '../angular_services/couch.service';
import { PasswordService } from '../angular_services/password.service';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  typedInPassword: string;
  typedInUsername: string;
  passwordWrong = false;

  constructor(private router: Router, private couchService: CouchService, private passwordService: PasswordService) {
  }

  ngOnInit() {
  }

  login() {
    const selector = {
      'selector': {
        'isAdmin': { '$eq': true }
      },
      'fields': ['worker_id', 'lastname', 'firstname', 'password', 'username']
    };

    this.couchService.doPost('workers/_find', selector).subscribe((admins: any) => {
      if (admins.docs.length === 0) {
        localStorage.setItem('loggedIn', '1');
        this.router.navigateByUrl('/');
      } else {
        const hash = this.passwordService.hash(this.typedInPassword);
        for (let i = 0; i < admins.docs.length; i++) {
          if (admins.docs[i].password === hash && admins.docs[i].username === this.typedInUsername) {
            localStorage.setItem('loggedIn', '1');
            this.passwordWrong = false;
            this.router.navigateByUrl('/');
          } else {
            this.passwordWrong = true;
          }
        }
      }
    }, err => {
      localStorage.setItem('loggedIn', '1');
      this.router.navigateByUrl('/');
    });
  }

  logout(): void {
    localStorage.setItem('loggedIn', '0');
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.login();
    }
  }
}
