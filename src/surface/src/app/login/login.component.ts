import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import PouchDB from 'pouchdb';
import { SynchService } from '../services/synch.service';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private synchService: SynchService) {
  }

  public username = '';
  public password = '';
  public md5: Md5;
  ngOnInit() {
  }

  loginListener() {
    this.login(this.router, this.username, this.password);
  }

  async login(router: Router, username: string, password: string) {
    let logedIn = false;
    if (username !== 'first_login') {
      this.md5 = new Md5();
      const self = this;
      const workers = await new PouchDB('workers');
      const allWorkers = await workers.allDocs();
      for (const worker of allWorkers.rows) {
        await workers.get(worker.id).then(async function (data: any) {
          self.md5.start();
          const tempPw = self.md5.appendStr(self.password).end();
          if (username === data.username && tempPw.toString() === data.password) {
            logedIn = true;
            localStorage.username = data._id;
            self.synchService.startSync();
            localStorage.setItem('loggedIn', '1');
            router.navigate(['/actionlist']);
          }
        });
      }
      if (!logedIn) {
        alert('Falsches Passwort oder Benutzername');
      }
    } else {
      localStorage.username = username;
      localStorage.setItem('loggedIn', '1');
      router.navigate(['/actionlist']);
    }
  }

  logout(): void {
    if (localStorage.username !== 'first_login') {
      this.synchService.startSync();
    }
    localStorage.setItem('loggedIn', '0');
    this.router.navigateByUrl('/login');
  }
}
