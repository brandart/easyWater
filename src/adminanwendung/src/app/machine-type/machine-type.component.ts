import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, DateAdapter, MatCheckbox } from '@angular/material';
import { CouchService } from '../angular_services/couch.service';
import { FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-machine-type',
  templateUrl: './machine-type.component.html',
  styleUrls: ['./machine-type.component.css']
})
export class MachineTypeComponent implements OnInit {

  displayForm = false;
  description = '';
  machines: Array<any>;

  dataSource: MatTableDataSource<any>;
  displayedColumns = [/*'id', */'description'];
  constructor(private couchService: CouchService) { }

  ngOnInit() {
    this.getMachineTypes();
  }

  closeDisplayForm() {
    this.displayForm = false;

    this.description = '';
  }

  setDisplayForm() {
    this.displayForm = true;

  }

  addMachineType() {
    const data = {
      'description': this.description
    };
    this.couchService.doPost('machines', data).subscribe(e => {
      this.closeDisplayForm();
      this.getMachineTypes();
    });
  }

  async getMachineTypes() {
    this.machines = new Array();
    const self = this;
    const resp: { rows: any[] } = <{ rows: any[] }>await this.couchService.doGetAllDocs('machines').pipe(first()).toPromise();
    // const requests = resp.rows.map(e => this.couchService.getDocument(e.id, 'workers').pipe(first()).toPromise());
    // const workers = await Promise.all(requests);


    for (const e of resp.rows) {
      const machine: any = await this.couchService.getDocument(e.id, 'machines').pipe(first()).toPromise();
      self.machines.push(machine);
    }
    this.dataSource = new MatTableDataSource(this.machines);

  }

}
