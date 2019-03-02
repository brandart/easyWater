import { Injectable } from '@angular/core';

@Injectable()
export class StartService {

  private serverLink: string;

  constructor() {
    this.serverLink = localStorage.getItem('serverLink');
  }

  getServerLink() {
    console.log(this.serverLink);
    return this.serverLink;
  }
}
