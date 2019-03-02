import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionsComponent } from '../actions/actions.component';
import { AddActionComponent } from '../add-action/add-action.component';

@Component({
  selector: 'app-actions-menu',
  templateUrl: './actions-menu.component.html',
  styleUrls: ['./actions-menu.component.css']
})
export class ActionsMenuComponent implements OnInit {
  selectedTabIndex: number;
  @ViewChild('actionList') private actionList: ActionsComponent;
  @ViewChild('addActionForm') private addActionForm: AddActionComponent;

  constructor() { }

  ngOnInit() {
  }

  tabClicked(event) {
    this.selectedTabIndex = event.index;

    if (event.index !== 1) {
      this.addActionForm.editActionBool = false;
    }

    if (event.index === 0) {  // "Wartungen" tab is active
      this.actionList.getActions();
      this.addActionForm.clearForm();
    } else if (event.index === 1) {
      this.addActionForm.fillCreateActionForm();
    }

  }

  edit(element): void {
    this.addActionForm.editActionBool = true;
    this.addActionForm.editAction(element);
  }

  addActionFromMachine(element) {
    console.log(element);
  }

}
