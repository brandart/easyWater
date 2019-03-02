import { Component, OnInit } from '@angular/core';
import {
  SUCCESSFULLY_LINK_DELETED,
  SUCCESSFULLY_LINK_SET
} from '../globals';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public serverLink = '';
  public serverLinkSet;
  constructor(private messageService: MessageService) {
    this.serverLink = localStorage.getItem('serverLink');
    if (!this.serverLink) {
      this.serverLinkSet = false;
    } else {
      this.serverLinkSet = true;
    }
  }

  ngOnInit() {
  }

  setServerLink() {
    localStorage.setItem('serverLink', this.serverLink);
    this.serverLinkSet = true;
    this.messageService.openSnackbar(SUCCESSFULLY_LINK_SET);
  }

  deleteServerLink() {
    localStorage.removeItem('serverLink');
    this.serverLinkSet = false;
    this.messageService.openSnackbar(SUCCESSFULLY_LINK_DELETED);
  }

}
