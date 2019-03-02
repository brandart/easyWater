import { Component, OnInit } from '@angular/core';
import { MessageService } from '../angular_services/message.service';
import {
  SUCCESSFULLY_LINK_DELETED,
  SUCCESSFULLY_LINK_SET
} from '../globals';

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
    if (this.serverLink.charAt(this.serverLink.length - 1) !== '/') {
      this.serverLink = this.serverLink + '/';
    }
    console.log(this.serverLink);
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
