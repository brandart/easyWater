import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { CouchService } from '../angular_services/couch.service';
import { MatTableDataSource, MatDialog, Sort, MatPaginator } from '@angular/material';
import { ActionDetailsComponent } from '../action-details/action-details.component';
import { SortingService } from '../angular_services/sorting.service';
import { FormControl } from '@angular/forms';
import { MessageService } from '../angular_services/message.service';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css']
})
export class ActionsComponent implements OnInit {
  selectedTabIndex: number;
  filterDate: FormControl;
  @ViewChild(MatPaginator) private paginator: MatPaginator;
  actions: Array<any>;
  showProgressbar: boolean;
  displayedColumns = ['type', 'customer', 'location', 'date', 'machine', 'options'];
  dataSource: MatTableDataSource<any>;
  @Output() public triggerEdit = new EventEmitter<any>();

  constructor(
    private couchService: CouchService,
    private matDialog: MatDialog,
    private sortingService: SortingService,
    private messageService: MessageService
  ) {
    this.actions = new Array();
    this.dataSource = new MatTableDataSource(this.actions);
    this.filterDate = new FormControl(this.calculateFilterDate());
  }

  ngOnInit() {
    this.getActions();
  }

  getActions() {
    this.actions = new Array();
    this.dataSource = new MatTableDataSource(this.actions);

    const selector: any = {
      'selector': {
        'done': { '$eq': false },
        'date': { '$gt': this.filterDate.value.toISOString() }
      },
      'fields': ['_id', '_rev', 'name', 'worker_id', 'machine_id', 'kunde_id', 'date']
    };

    this.couchService.doPost('actions/_find', selector).subscribe((resp: any) => {
      if (resp.docs.length > 0) {
        this.showProgressbar = true;
      } else {
        this.showProgressbar = false;
      }
      let added = 0;

      for (let i = 0; i < resp.docs.length; i++) {
        let customer: string;
        let machine: string;
        let location: string;

        this.couchService.getCustomer(resp.docs[i].kunde_id).then((retrn: any) => {
          customer = retrn.docs[0].cFirma + ' - ' + retrn.docs[0].cZusatz;
        }).then(() => {
          this.couchService.getMachine(resp.docs[i].machine_id).then((retrn: any) => {
            if (retrn) {
              machine = retrn.serialnumber;
              location = retrn.room;
            }
          }).then(() => {
            this.couchService.getWorker(resp.docs[i].worker_id).then((retrn: any) => {
              this.actions.push({
                _id: resp.docs[i]._id,
                _rev: resp.docs[i]._rev,
                type: resp.docs[i].name,
                name: resp.docs[i].name,
                worker_id: resp.docs[i].worker_id,
                worker: retrn.lastname,
                customer_id: resp.docs[i].kunde_id,
                customer: customer,
                machine_id: resp.docs[i].machine_id,
                machine: machine,
                location: location,
                date: resp.docs[i].date
              });
              added++;

              if (added === resp.docs.length) {
                const startSort: Sort = {
                  active: 'date',
                  direction: 'asc'
                };

                this.dataSource = new MatTableDataSource(this.sortingService.sortData(startSort, this.actions));
                this.dataSource.paginator = this.paginator;
                this.showProgressbar = false;
              }
            });
          });
        });
      }
    });

  }

  openDeleteDialog(id: string, _rev: string) {
    // TODO:
    // implement DeleteDialog
    this.deleteAction(id, _rev);
  }

  deleteAction(id: string, _rev: string) {
    this.couchService.doDelete('actions', id, _rev).subscribe(resp => {
      this.getActions();
      this.messageService.openSnackbar('Aktion erfolgreich gelöscht!');
    }, error => {
      console.log(error);
    });
  }

  showDetails(action) {
    this.matDialog.open(ActionDetailsComponent, {
      width: '600px',
      data: action
    });
  }

  sortData(event) {
    const sortedData = this.sortingService.sortData(event, this.actions);

    this.dataSource = new MatTableDataSource(sortedData);
  }

  proofHighlight(date: string) {
    return new Date().getTime() > new Date(date).getTime();
  }

  editAction(element) {
    this.triggerEdit.emit(element);
  }

  calculateFilterDate(): Date {
    const date: Date = new Date();

    date.setMonth(date.getMonth() - 2);

    return date;
  }

  filterDateChanged(event) {
    this.getActions();
  }
}
