import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-action-details',
  templateUrl: './action-details.component.html',
  styleUrls: ['./action-details.component.css']
})
export class ActionDetailsComponent implements OnInit {

  data: any;



  constructor(private dialogRef: MatDialogRef<ActionDetailsComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.data = data;
   }

  ngOnInit() {
  }

}
