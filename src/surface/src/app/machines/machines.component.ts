import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Sort } from '@angular/material';
import { FormControl } from '@angular/forms';
import PouchDB from 'pouchdb';
import findPlugin from 'pouchdb-find';
import { MessageService } from '../services/message.service';
import {
  SUCCESSFULLY_ADDED
} from '../globals';

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.css']
})
export class MachinesComponent implements OnInit {

  selectedTypeId: number;
  selectedCustomerId: number;
  room = '';
  selectedServiceInterval: number;
  serialNumber: string;
  machineTypes: Array<any> = new Array();
  customers: Array<any> = new Array();
  // @Output() public triggerSelectedIndexChanged = new EventEmitter<any>();

  public filteredOptions: Observable<object>;
  public myControl = new FormControl();
  selectedCustomer: any = {};


  constructor(public messageService: MessageService ) { 
    PouchDB.plugin(findPlugin);
  }

  ngOnInit() {
    this.fillData();
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

  saveMachine() {
    const cust: any = this.selectedCustomer;
    const machines_kunde = new PouchDB('machines_kunde');
    const machine = {
      'kunde_id': cust.kKunde,
      'machineTyp_id': this.selectedTypeId,
      'room': this.room,
      'serialnumber': this.serialNumber,
      'serviceInterval': this.selectedServiceInterval,
      'nextService': this.calculateNextService(this.selectedServiceInterval)
    };

    machines_kunde.post(machine).then(resp => {
      console.log('maschine hinzugefügt' + resp);
      this.messageService.openSnackbar(SUCCESSFULLY_ADDED);
      this.clearData();
    });

  }

  clearData() {
    this.serialNumber = '';
    this.room = '';
    this.selectedServiceInterval = 0;
    this.selectedTypeId = 0;
    this.selectedCustomer = '';
    this.fillData();
  }

  calculateNextService(serviceInterval: number): Date {
    const nextServiceDate = new Date();
    nextServiceDate.setMonth(nextServiceDate.getMonth() + serviceInterval);

    return nextServiceDate;
  }

  async fillData() {
    const types = await new PouchDB('machines');
    const customersDb = await new PouchDB('tkunde');
    const self = this;
    types.allDocs().then(resp => {
      resp.rows.forEach(e => {
        types.get(e.id).then(type => {
          self.machineTypes.push(type);
        });
      });
    });


    customersDb.find({
      selector: {}
    }).then(async function (result) {
      console.log(result);
      self.customers = result.docs;

      const isAsc = true;
      self.customers = await self.customers.sort((a, b) => {
        return a.cFirma.toLowerCase().localeCompare(b.cFirma.toLowerCase()) * (isAsc ? 1 : -1);
      });
      self.setAutoComplete();
    });
  }
}
