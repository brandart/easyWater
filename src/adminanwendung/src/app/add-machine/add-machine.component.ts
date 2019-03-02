import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CouchService } from '../angular_services/couch.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Sort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MessageService } from '../angular_services/message.service';
import { SUCCESSFULLY_ADDED } from '../globals';

@Component({
  selector: 'app-add-machine',
  templateUrl: './add-machine.component.html',
  styleUrls: ['./add-machine.component.css']
})
export class AddMachineComponent implements OnInit {

  selectedTypeId: string;
  selectedCustomerId: number;
  room: string;
  selectedServiceInterval: number;
  serialNumber: string;
  machineTypes: Array<any>;
  customers: Array<any>;
  @Output() public triggerSelectedIndexChanged = new EventEmitter<any>();

  public filteredOptions: Observable<object>;
  public myControl = new FormControl();
  selectedCustomer: any = {};

  constructor(private couchService: CouchService, private messageService: MessageService) {
    this.customers = new Array();
  }

  ngOnInit() {
    this.fillAddMachineFormWithData();
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
    const machine = {
      'kunde_id': cust.kKunde,
      'machineTyp_id': this.selectedTypeId,
      'room': this.room,
      'serialnumber': this.serialNumber,
      'serviceInterval': this.selectedServiceInterval,
      'nextService': this.calculateNextService(this.selectedServiceInterval)
    };

    this.couchService.doPost('machines_kunde', machine).subscribe(msg => {
      this.messageService.openSnackbar(SUCCESSFULLY_ADDED);
      this.triggerSelectedIndexChanged.emit(0);
      this.clearForm();
    }, error => {
      console.log(error);
    });

  }

  fillAddMachineFormWithData() {
    let selector: any = {
      'selector': {
      },
      'fields': ['_id', 'description']
    };

    this.couchService.doPost('machines/_find', selector).subscribe((resp: any) => {
      this.machineTypes = resp.docs;
    });

    selector = {
      'selector': {
      },
      'fields': ['kKunde', 'cFirma']
    };

    this.couchService.doPost('tkunde/_find', selector).subscribe((resp: any) => {
      this.customers = new Array();
      for (let i = 0; i < resp.docs.length; i++) {
        const cust = resp.docs[i];
        cust.kKunde = parseInt(cust.kKunde, 10);
        this.customers.push(cust);
      }

      // Sort Customers ASC
      const isAsc = true;
      this.customers.sort((a, b) => {
        return a.cFirma.toLowerCase().localeCompare(b.cFirma.toLowerCase()) * (isAsc ? 1 : -1);
      });

      this.setAutoComplete();
    });
  }

  clearForm() {
    this.selectedTypeId = '';
    this.selectedCustomerId = 0;
    this.selectedServiceInterval = 0;
    this.room = '';
    this.serialNumber = '';
  }

  calculateNextService(serviceInterval: number): Date {
    const nextServiceDate = new Date();

    nextServiceDate.setMonth(nextServiceDate.getMonth() + serviceInterval);

    return nextServiceDate;
  }

}
