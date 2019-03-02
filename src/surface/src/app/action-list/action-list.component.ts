import { Component, OnInit } from '@angular/core';
import { StartService } from '../services/start.service';
import PouchDB from 'pouchdb';
import findPlugin from 'pouchdb-find';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.css']
})
export class ActionListComponent implements OnInit {

  private serverLink: string;
  public displayedColumns: string[] = ['name', 'date', 'action', 'edit'];
  public spontaneousAction = false;

  public actionType: string;
  public actionMachineId: number;
  public actionWorkerId: number;
  public selectedCustomer: any = {};


  workers: Array<any>;
  machines: Array<any>;
  customers: Array<any>;


  public myControl = new FormControl();
  public filteredOptions: Observable<object>;


  dataSource;
  constructor(private startService: StartService, private router: Router) {
    this.serverLink = startService.getServerLink();
    this.listToDos('All');
    PouchDB.plugin(findPlugin);

    this.getDataForNewActionFormular();

    console.log(this.workers);
  }

  setAutoComplete() {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith<string | any>(''),
        map(value => typeof value === 'string' ? value : value.cFirma),
        map(name => name ? this._filter(name) : this.customers.slice())
      );
  }

  _filter(name: string): any[] {
    const filterValue = name.toLowerCase();

    return this.customers.filter(option => option.cFirma.toLowerCase().includes(filterValue));
  }

  displayFn(user?: any): string | undefined {
    return user ? user.cFirma : undefined;
  }

  async listToDos(mode: string) {
    const worker_id = localStorage.username;

    const actions = await new PouchDB('actions');

    const allActions = await actions.allDocs();

    const rowsArr = [];

    // get all docs from the pouchdb
    for (const row of allActions.rows) {
      await actions.get(row.id).then(async function (rowResult) {
        const data: any = rowResult;
        // bool we need for the filter
        let shouldList = true;

        if (mode !== 'All') {
          if (data.name !== mode) {
            // set the boolean
            shouldList = false;
          }
        }

        // skip the actions, which are not for the current user or done
        if (data.worker_id !== worker_id || data.done === true) {
          shouldList = false;
        }

        // check if the action is for the current user
        if (shouldList) {
          // get the other data from the database and print it on the html page
          const kunde = await new PouchDB('tkunde');
          await kunde.find({
            selector: {
              kKunde: { $eq: data.kunde_id.toString() }
            }
          }).then(async function (res: any) {
            const dataK: any = res;
            rowsArr.push({ name: dataK.docs[0].cFirma, date: data.date, action: data.name, action_id: data.action_id, _id: data._id });
          }).catch(function (err) {
            console.log('theres an error' + err);
          });
        }
      });
    }
    this.dataSource = new MatTableDataSource(rowsArr);
  }

  performAction(_id) {
    if (_id) {
      this.router.navigate(['/perform-action/' + _id]);
    } else {
      console.log(this.selectedCustomer);
      localStorage.actionData = JSON.stringify({
        actionType: this.actionType.toString(),
        actionWorkerId: this.actionWorkerId,
        actionMachineId: this.actionMachineId,
        selectedCustomer: this.selectedCustomer._id.toString()
      });

      this.router.navigate(['/perform-action/' + _id]);
    }
  }

  setSpontaneous() {
    this.spontaneousAction = !this.spontaneousAction;
  }

  async getDataForNewActionFormular() {
    const workersDB = await new PouchDB('workers');
    const customersDB = await new PouchDB('tkunde');

    const self = this;

    await workersDB.find({
      selector: {}
    }).then(async function (result) {
      self.workers = result.docs;
    });


    await customersDB.find({
      selector: {}
    }).then(async function (result) {
      self.customers = result.docs;

      // Sort Customers ASC
      const isAsc = true;
      self.customers.sort((a, b) => {
        return a.cFirma.toLowerCase().localeCompare(b.cFirma.toLowerCase()) * (isAsc ? 1 : -1);
      });

      self.setAutoComplete();
    });


  }

  async getMachineData(kunde_id: string) {
    const self = this;
    const machinesDB = await new PouchDB('machines_kunde');

    await machinesDB.find({
      selector: {
        kunde_id: { $eq: Number.parseInt(kunde_id) }
      }
    }).then(async function (result) {
      self.machines = result.docs;

      // Sort Machines ASC
      const isAsc = true;
      self.machines = self.machines.sort((a, b) => {
        return a.serialnumber.toLowerCase().localeCompare(b.serialnumber.toLowerCase()) * (isAsc ? 1 : -1);
      });
    });
  }

  ngOnInit() {
  }
}
