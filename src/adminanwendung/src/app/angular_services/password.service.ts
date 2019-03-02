import { Injectable } from '@angular/core';
import {Md5} from 'ts-md5/dist/md5';


@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  md5 = new Md5();
  constructor() {
  }

  hash(toHash: string): string {
    this.md5.start();
    const hashed = this.md5.appendStr(toHash).end();
    return hashed.toString();
  }
}
