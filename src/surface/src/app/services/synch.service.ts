import { Injectable } from '@angular/core';
import { StartService } from '../services/start.service';
import { MessageService } from '../services/message.service';
import PouchDB from 'pouchdb';
import {
  SUCCESSFULLY_SYNCHRONISED,
  FAILED_SYNCHRINISED
} from '../globals';

@Injectable({
  providedIn: 'root'
})
export class SynchService {

  private serverLink: string;
  private successfull = true;

  constructor(public startService: StartService,
    public messageService: MessageService) {
    this.serverLink = startService.getServerLink();
  }

  startSync() {
    this.pull();
  }

  pull() {
    this.successfull = true;
    const machines_kunde = new PouchDB(this.serverLink + 'machines_kunde', );
    this.sync(machines_kunde, 'machines_kunde', false);

    const workers = new PouchDB(this.serverLink + 'workers');
    this.sync(workers, 'workers', false);

    const machines = new PouchDB(this.serverLink + 'machines');
    this.sync(machines, 'machines', false);

    const actions = new PouchDB(this.serverLink + 'actions');
    this.sync(actions, 'actions', false);

    const tkunde = new PouchDB(this.serverLink + 'tkunde');
    this.sync(tkunde, 'tkunde', true);


  }

  sync(remoteDatabase: PouchDB.Database<{}>, dbName: string, lastOne: boolean) {
    const db = new PouchDB(dbName);
    const self = this;
    db.sync(remoteDatabase, {
      timeout: 2000
    }).on('change', function (info) {
      console.log('change');
    }).on('paused', function (err) {
      console.log('pause: \n' + err);
    }).on('active', function () {
      console.log('active');
    }).on('denied', function (err) {
      console.log('denied');
    }).on('complete', function (info) {
      console.log('complete');
      self.messageService.openSnackbar(SUCCESSFULLY_SYNCHRONISED);
    }).on('error', function (err) {
      self.messageService.openSnackbar(FAILED_SYNCHRINISED);
      this.successfull = false;

      console.log('error: \n ' + JSON.stringify(err));
    });
    /*if (lastOne && this.successfull) {
      console.log('show me');
      this.messageService.openSnackbar(SUCCESSFULLY_SYNCHRONISED);
    } else {
      this.messageService.openSnackbar(FAILED_SYNCHRINISED);
    }*/
  }

}
