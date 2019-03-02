import { Component, OnInit } from '@angular/core';
import { StartService } from '../services/start.service';
import { MessageService } from '../services/message.service';
import PouchDB from 'pouchdb';
import { SUCCESSFULLY_SYNCHRONISED,
    FAILED_SYNCHRINISED } from '../globals';

@Component({
    selector: 'app-synchronisation',
    templateUrl: './synchronisation.component.html',
    styleUrls: ['./synchronisation.component.css']
})
export class SynchronisationComponent implements OnInit {

    private serverLink: string;

    constructor(public startService: StartService,
        public messageService: MessageService) {
        this.serverLink = startService.getServerLink();
    }

    ngOnInit() {
    }


    push() {
        const dbAction = new PouchDB('actions');
        const remoteDatabaseAction = new PouchDB(this.serverLink + 'actions');
        this.pushDbs(dbAction, remoteDatabaseAction);

        const dbMachine_kunde = new PouchDB('machines_kunde');
        const remoteDatabaseMachine_kunde = new PouchDB(this.serverLink + 'machines_kunde');
        this.pushDbs(dbMachine_kunde, remoteDatabaseMachine_kunde);
    }
    pushDbs(db: PouchDB.Database<{}>, remoteDatabase: PouchDB.Database<{}>) {
        // const db = new PouchDB('actions');
        // const remoteDatabase = new PouchDB(this.serverLink + 'actions');

        db.replicate.to(remoteDatabase, {
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
        }).on('error', function (err) {
            this.messageService.openSnackbar(FAILED_SYNCHRINISED);
            console.log('error: \n ' + JSON.stringify(err));
        });
        this.messageService.openSnackbar(SUCCESSFULLY_SYNCHRONISED);
    }

    pull() {
        const machines_kunde = new PouchDB(this.serverLink + 'machines_kunde');
        this.sync(machines_kunde, 'machines_kunde');

        const workers = new PouchDB(this.serverLink + 'workers');
        this.sync(workers, 'workers');

        const machines = new PouchDB(this.serverLink + 'machines');
        this.sync(machines, 'machines');

        const actions = new PouchDB(this.serverLink + 'actions');
        this.sync(actions, 'actions');

        const tkunde = new PouchDB(this.serverLink + 'tkunde');
        this.sync(tkunde, 'tkunde');

        this.messageService.openSnackbar(SUCCESSFULLY_SYNCHRONISED);
    }

    sync(remoteDatabase: PouchDB.Database<{}>, dbName: string) {
        const db = new PouchDB(dbName);

        db.replicate.from(remoteDatabase, {
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
        }).on('error', function (err) {
            this.messageService.openSnackbar(FAILED_SYNCHRINISED);
            console.log('error: \n ' + JSON.stringify(err));
        });
        console.log(dbName);
    }

}
