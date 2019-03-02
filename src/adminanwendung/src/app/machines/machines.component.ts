import { Component, OnInit, ViewChild } from '@angular/core';
import { ListMachinesComponent } from '../list-machines/list-machines.component';
import { AddMachineComponent } from '../add-machine/add-machine.component';

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.css']
})
export class MachinesComponent implements OnInit {

  selectedTabIndex: number;
  @ViewChild(ListMachinesComponent) private listMachinesComponent: ListMachinesComponent;
  @ViewChild(AddMachineComponent) private addMachineComponent: AddMachineComponent;

  constructor() { }

  ngOnInit() {
  }

  tabClicked(event) {
    this.selectedTabIndex = event.index;

    if (this.selectedTabIndex === 0) {
      this.addMachineComponent.clearForm();
      this.listMachinesComponent.listData();
    } else if (this.selectedTabIndex === 1) {
      this.addMachineComponent.fillAddMachineFormWithData();
    }
  }

}
