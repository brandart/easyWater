import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, Sort } from '@angular/material';
import { CouchService } from '../angular_services/couch.service';
import { SortingService } from '../angular_services/sorting.service';
import { MessageService } from '../angular_services/message.service';
import { SUCCESSFULLY_DELTED } from '../globals';

@Component({
  selector: 'app-list-machines',
  templateUrl: './list-machines.component.html',
  styleUrls: ['./list-machines.component.css']
})
export class ListMachinesComponent implements OnInit {

  showProgressbar = false;
  dataSource: MatTableDataSource<any>;
  machines: Array<any>;
  displayedColumns = ['customer', 'location', 'serialnumber', 'machineTyp', 'nextService', 'options'];

  constructor(
    private couchService: CouchService,
    private sortingService: SortingService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.listData();
  }

  listData() {
    this.machines = new Array();
    this.dataSource = new MatTableDataSource(this.machines);
    const selector = {
      'selector': {
        // 'machine_id': { '$gt': 0 }
      },
      'fields': ['_id', '_rev', 'serialnumber', 'room', 'kunde_id', 'machineTyp_id', 'serviceInterval', 'nextService']
    };

    this.couchService.doPost('machines_kunde/_find', selector).subscribe((machines: any) => {
      let added = 0;
      if (machines.docs.length > 0) {
        this.showProgressbar = true;
      }

      for (let i = 0; i < machines.docs.length; i++) {
        let machineCustomer;
        let machineType;
        this.couchService.getCustomer(machines.docs[i].kunde_id).then((customer: any) => {
          machineCustomer = customer.docs[0].cFirma + ' - ' + customer.docs[0].cZusatz;
          this.couchService.getMachineType(machines.docs[i].machineTyp_id).then((type: any) => {
            machineType = type.description;
          }).then(() => {
            this.machines.push({
              _id: machines.docs[i]._id,
              _rev: machines.docs[i]._rev,
              serialnumber: machines.docs[i].serialnumber,
              room: machines.docs[i].room,
              customer: machineCustomer,
              machineType: machineType,
              serviceInterval: machines.docs[i].serviceInterval,
              date: machines.docs[i].nextService,
              backgroundColor: this.calculateBackgroundColor(machines.docs[i].nextService)
            });

            added++;

            if (added === machines.docs.length) {
              const startSort: Sort = {
                active: 'date',
                direction: 'asc'
              };

              this.dataSource = new MatTableDataSource(this.sortingService.sortData(startSort, this.machines));
              this.showProgressbar = false;
            }
          });
        });
      }
    });
  }

  openDeleteDialog(_id, _rev) {
    // TODO:open delete Dialog
    this.deleteMachine(_id, _rev);
  }

  deleteMachine(_id, _rev) {
    const selector = {
      'selector': {
        'machine_id': { '$eq': _id }
      },
      'fields': ['_id']
    };
    this.couchService.doPost('actions/_find', selector).subscribe((resp: any) => {
      if (resp.docs.length === 0) {
        this.couchService.doDelete('machines_kunde', _id, _rev).subscribe(() => {
          this.messageService.openSnackbar(SUCCESSFULLY_DELTED);
          this.listData();
        });
      } else {
        this.messageService.openSnackbar('Maschine darf nicht gelöscht werden!');
      }
    });
  }

  calculateBackgroundColor(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();

    if (date <= today) {
      return '#f30e0e93';
    }

    today.setDate(today.getDate() + 14);

    if (date <= today) {
      return 'rgba(236, 236, 9, 0.842)';
    }

    return 'white';
  }
}
