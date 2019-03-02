import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sort } from '@angular/material';
import { CouchService } from '../angular_services/couch.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSort } from '@angular/material';
import { MessageService } from '../angular_services/message.service';
import { SUCCESSFULLY_UPDATED, SUCCESSFULLY_ADDED } from '../globals';

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.css']
})
export class AddActionComponent implements OnInit {
  selectedTabIndex: number;

  showProgressbar: boolean;

  // variables for add or edit an Action
  actionCustomerId: number;
  actionType: string;
  actionWorkerId: number;
  actionMachineId: number;
  actionDate = new FormControl(new Date());
  actionId: number;
  action_id: string;
  action_rev: string;

  workers: Array<any>;
  customers: Array<any>;
  machines: Array<any>;

  editActionBool = false;

  public filteredOptions: Observable<object>;
  public myControl = new FormControl();
  selectedCustomer = {};

  public filteredOptions2: Observable<object>;
  public myControl2 = new FormControl();
  selectedMachine = {};

  @Output() public triggerSelectedTabIndexChanged = new EventEmitter<any>();

  constructor(private couchService: CouchService, private messageService: MessageService) {
    this.customers = new Array();
  }

  ngOnInit() {
  }

  setAutoComplete() {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith<string | any>(''),
        map(value => typeof value === 'string' ? value : value.cFirma),
        map(name => name ? this._filter(name) : this.customers.slice())
      );
  }

  setAutoCompleteMachine() {
    if (this.machines.length > 0) {
      console.log('machines: ' + this.machines);
      this.filteredOptions2 = this.myControl2.valueChanges
        .pipe(
          startWith<string | any>(''),
          map(value => typeof value === 'string' ? value : value.serialnumber),
          map(name => name ? this._filter2(name) : this.machines.slice())
        );
    }
  }
  _filter(name: string): any[] {
    const filterValue = name.toLowerCase();

    return this.customers.filter(option => option.cFirma.toLowerCase().includes(filterValue));
  }

  _filter2(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.machines.filter(option => option.serialnumber.toLowerCase().includes(filterValue));
  }

  displayFn(user?: any): string | undefined {
    return user ? user.cFirma : undefined;
  }

  displayFn2(machine?: any): string | undefined {
    return machine ? machine.serialnumber : undefined;
  }
  listCustomer() {
    const cust: any = this.selectedCustomer;
    this.fillMachineSelectionWithMachinesOfCustomer(cust.kKunde);
  }

  fillMachineSelectionWithMachinesOfCustomer(id: number) {
    this.actionMachineId = undefined;
    const selectedCustomer = id;
    this.actionCustomerId = id;

    const selector = {
      'selector': {
        'kunde_id': { '$eq': selectedCustomer }
      },
      'fields': ['_id', 'serialnumber']
    };

    this.couchService.doPost('machines_kunde/_find', selector).subscribe((resp: any) => {
      this.machines = resp.docs;
      // Sort Machines ASC
      const isAsc = true;
      this.machines = this.machines.sort((a, b) => {
        return a.serialnumber.toLowerCase().localeCompare(b.serialnumber.toLowerCase()) * (isAsc ? 1 : -1);
      });
      this.setAutoCompleteMachine();
    });

  }

  save() {
    this.showProgressbar = true;
    if (this.editActionBool) {
      this.saveEdit();
    } else {
      this.saveAdd();
    }
  }

  saveAdd() {
    const machine: any = this.selectedMachine;
    const actionToAdd = {
      'name': this.actionType,
      'worker_id': this.actionWorkerId,
      'machine_id': machine._id,
      'kunde_id': this.actionCustomerId,
      'date': this.actionDate.value,
      'done': false
    };
    console.log('ACTIONTOADD', actionToAdd);
    this.couchService.doPost('actions', actionToAdd).subscribe(
      msg => {
        console.log(msg);
        this.showProgressbar = false;
        this.editActionBool = false;
      },
      error => {
        console.log(error);
        this.showProgressbar = false;
        this.editActionBool = false;
      }
    ).add(() => {
      this.clearForm();
      this.messageService.openSnackbar(SUCCESSFULLY_ADDED);
    });
  }

  saveEdit() {
    const actionToEdit = {
      '_id': this.action_id,
      '_rev': this.action_rev,
      'name': this.actionType,
      'worker_id': this.actionWorkerId,
      'machine_id': this.actionMachineId,
      'kunde_id': this.actionCustomerId,
      'date': this.actionDate.value,
      'done': false
    };

    this.couchService.doPut('actions', actionToEdit).subscribe(
      msg => {
        this.showProgressbar = false;
      },
      error => {
        this.showProgressbar = false;
      }
    ).add(() => {
      this.editActionBool = false;
      this.clearForm();
      this.messageService.openSnackbar(SUCCESSFULLY_UPDATED);
    });
  }
  checkEdit() {
    console.log(this.editActionBool);
    this.editActionBool = true;
  }

  editAction(action: any) {
    this.editActionBool = true;
    this.triggerSelectedTabIndexChanged.emit(4);

    this.action_id = action._id;
    this.action_rev = action._rev;
    this.actionType = action.name;
    this.actionWorkerId = action.worker_id;
    this.actionCustomerId = action.customer_id;
    this.fillMachineSelectionWithMachinesOfCustomer(this.actionCustomerId);
    this.actionMachineId = action.machine_id;
    this.actionDate = new FormControl(new Date(action.date));
  }

  clearForm() {
    this.selectedCustomer = {};
    this.selectedMachine = {};
    this.actionCustomerId = 0;
    this.actionDate = new FormControl(new Date());
    this.actionMachineId = 0;
    this.actionType = '';
    this.actionWorkerId = 0;
    this.machines = new Array<any>();
  }

  fillCreateActionForm() {
    let selector: any = {
      'selector': {
      },
      'fields': ['_id', 'lastname']
    };

    // Fill the "workers" Array
    this.couchService.doPost('workers/_find', selector).subscribe((resp: any) => {
      this.workers = resp.docs;
    });

    selector = {
      'selector': {
        'kKunde': { '$gt': 0 }
      },
      'fields': ['kKunde', 'cFirma', 'cZusatz']
    };

    // Fill the "customers" Array
    this.couchService.doPost('tkunde/_find', selector).subscribe((resp: any) => {
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

  machineSelectionChanged(option) {
    if (this.actionType === 'Wartung') {
      this.couchService.getMachine(option._id).then((resp: any) => {
        this.actionDate = new FormControl(new Date(resp.nextService));
      });
    }
  }

}
