import { Component, OnInit } from '@angular/core';
import { CouchService } from '../angular_services/couch.service';
import { MatTableDataSource, DateAdapter, MatCheckbox } from '@angular/material';
import { FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import {Md5} from 'ts-md5/dist/md5';


@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.css']
})
export class WorkersComponent implements OnInit {

  dataSource: MatTableDataSource<any>;
  displayedColumns = ['id', 'username',  'name' /*, 'action' */];
  workers: Array<any>;
  displayForm = false;
  workerLastname;
  workerFirstname;
  workerUsername;
  workerId = 0;
  workerPassword;
  worker_id;
  worker_rev;
  change = false;
  isAdmin = false;

  constructor(private couchService: CouchService) {
  }

  ngOnInit() {
    this.getWorkers();
  }


  closeDisplayForm() {
    this.displayForm = false;
    this.resetForm();
  }

  changeWorker(id: string) {
    this.couchService.getDocument(id, 'workers').subscribe(data => {
      const myObject: any = data;
      this.worker_id = myObject._id;
      this.worker_rev = myObject._rev;
      this.workerId = myObject.worker_id;
      this.workerFirstname = myObject.firstname;
      this.workerLastname = myObject.lastname;
      this.workerPassword = myObject.password;
      this.workerUsername = myObject.username;
      this.isAdmin = myObject.isAdmin;
      this.change = true;
      this.setDisplayForm();
    });
  }

  hash(name: string) {
    const md5 = new Md5();
    return md5.appendStr(name).end();
  }

  setDisplayForm() {
    this.displayForm = true;
  }

  resetForm() {
    this.workerId = 0;
    this.workerLastname = '';
    this.workerFirstname = '';
    this.workerPassword = '';
    this.workerUsername = '';
    this.isAdmin = false;
  }
  addWorker() {
    if (!this.change) {
      const hashedPw = this.hash(this.workerPassword);
      console.log(this.isAdmin);
      const data = {
        'worker_id': this.workerId,
        'lastname': this.workerLastname,
        'firstname': this.workerFirstname,
        'password': hashedPw,
        'isAdmin': this.isAdmin,
        'username': this.workerUsername
      };
      this.couchService.doPost('workers', data).subscribe(e => {
        this.closeDisplayForm();
        this.getWorkers();
      });
    } else {
      this.updateWorker();
    }
  }

  deleteWorker(id: string, rev: string) {
    this.couchService.doDelete('workers', id, rev).subscribe(data => {
      console.log('gelöscht');
      this.getWorkers();
    });
  }

  updateWorker() {
    const data = {
      '_id': this.worker_id,
      '_rev': this.worker_rev,
      'worker_id': this.workerId,
      'lastname': this.workerLastname,
      'firstname': this.workerFirstname,
      'password': this.workerPassword,
      'isAdmin': this.isAdmin,
      'username': this.workerUsername
    };
    console.log('update: ' + data._id, data._rev);
    this.couchService.doPut('workers', data).subscribe(resp => {
      console.log(resp);
      this.closeDisplayForm();
      this.getWorkers();
    });
  }

  async getWorkers() {
    this.workers = new Array();
    const self = this;
    const resp: { rows: any[] } = <{ rows: any[] }>await this.couchService.doGetAllDocs('workers').pipe(first()).toPromise();
    // const requests = resp.rows.map(e => this.couchService.getDocument(e.id, 'workers').pipe(first()).toPromise());
    // const workers = await Promise.all(requests);


    for (const e of resp.rows) {
      const worker: any = await this.couchService.getDocument(e.id, 'workers').pipe(first()).toPromise();
      self.workers.push(worker);
    }
    this.dataSource = new MatTableDataSource(this.workers);
  }
}
