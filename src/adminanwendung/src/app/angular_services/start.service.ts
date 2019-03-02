import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StartService {

  private serverLink: string;

  constructor() {
    this.serverLink = localStorage.getItem('serverLink');
    localStorage.setItem('loggedIn', '0');
    localStorage.setItem('selectedIndex', '0');
  }

  getServerLink() {
    return this.serverLink;
  }
}
