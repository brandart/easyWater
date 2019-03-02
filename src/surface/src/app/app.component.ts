import { Component } from '@angular/core';
import { StartService } from './services/start.service';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private startService: StartService, private messageService: MessageService) {
  }
}
