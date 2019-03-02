import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import PouchDB from 'pouchdb';
import { ActivatedRoute, Router } from '@angular/router';
import findPlugin from 'pouchdb-find';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-perform-action',
  templateUrl: './perform-action.component.html',
  styleUrls: ['./perform-action.component.css']
})
export class PerformActionComponent implements OnInit {

  @ViewChild(SignaturePad) signaturePad: SignaturePad;

  @ViewChild('content') content: ElementRef;


  /*
   * options for the signature pad
   */
  signaturePadOptions = {
    'minWidth': 1,
    penColor: 'black',
    backgroundColor: 'white',
    canvasWidth: 400,
    canvasHeight: 200
  };

  showButtons = true;

  rowsWartCount = 0;
  rowsGerCount = 0;

  // Variables for pdf export (A4)
  private pdfWidth = 210;
  private pdfHeight = 297;
  private pdfPage: number;
  private focusPage: number;

  /*
   * array for the rows of the 'Geräte' table
   * filled with 0 because the value of the array is never used
   */
  rowsGer = [['', '', '']];
  /*
   * array for the rows of the 'Material | Anzahl | Beizeichnung' table
   * filled with 0 because the value of the array is never used
   */
  rowsWart = [['', '', '']];

  date = new Date();

  // date for the next service operation
  dateLater = new Date();

  /*
   * array for the prefilled data in the formular
   */
  actionData = {
    action_type: '',
    customer: '',
    customerNumber: '',
    customerId: '',
    technicianName: '',
    street: '',
    city: '',
    telephone: '',
    email: '',
    nextAction: '',
    actionNumber: '',
    vehicle: '',
    approach: '',
    departure: '',
    partner: '',
    timeForWork: '',
    distance: '',
    machineId: ''
  };

  mark = {
    name: 'Zustand (Note 1-6)',
    number: ''
  };

  differentWorkingTypes = [
    [
      'Sichtprüfung',
      false
    ],
    [
      'Filter gewechselt',
      false
    ],
    [
      'UV-Lampe gewechselt',
      false
    ],
    [
      'Reinigungsmittel ein/ausgespült',
      false
    ],
    [
      'Aquastopfunktion geprüft',
      false
    ],
    [
      'CO2 und Wasserdichtigkeit geprüft',
      false
    ],
    [
      'Ausgabeknopf gereinigt',
      false
    ],
    [
      'Spenderdüse und Ausgabe gereinigt',
      false
    ],
    [
      'Entkalkung durchgeführt',
      false
    ],
    [
      'Funktionsprüfung fehlerfrei durchgeführt',
      false
    ],
    [
      'Bedienungseinweisung erfolgt',
      false
    ],
    [
      'keine Sichtbaren Mängel vorhanden',
      false
    ]
  ];

  actionDataText = [
    'Zu Auftr.-Nr.: ',
    'Kunde:',
    'Kunden-Nr:',
    'Fahrzeug:',
    'Name Techniker: ',
    'Straße, Nr.: ',
    'PLZ, Ort: ',
    'Anfahrt (Uhrzeit): ',
    'Abfahrt (Uhrzeit): ',
    'Ansprechpartner: ',
    'Arbeitszeit: ',
    'Gefahrene Kilometer: ',
    'Telefon: ',
    'Email: '
  ];

  selectedActionType: string;


  ngOnInit() {
  }

  constructor(private route: ActivatedRoute, private router: Router) {
    PouchDB.plugin(findPlugin);
    this.getData();

    this.selectedActionType = this.actionData.action_type;

    this.dateLater.setMonth(this.dateLater.getMonth() + 6);

  }

  addRowWart() {
    if (this.rowsWart.length < 7) {
      this.rowsWartCount++;
      this.rowsWart[this.rowsWartCount.valueOf()] = ['', '', ''];
    }
  }

  deleteRowWart() {
    this.rowsWartCount--;
    this.rowsWart.pop();
  }

  addRowGer() {
    if (this.rowsGer.length < 1) {
      this.rowsGerCount++;
      this.rowsGer[this.rowsGerCount.valueOf()] = ['', '', ''];
    }
  }

  deleteRowGer() {
    this.rowsGerCount--;
    this.rowsGer.pop();
  }

  async getData() {
    const actData = this.actionData;

    if (this.route.snapshot.params.id !== 'undefined') {
      const actions = await new PouchDB('actions');
      const customers = await new PouchDB('tkunde');
      const workers = await new PouchDB('workers');

      const allActions = await actions.allDocs();
      const _id = this.route.snapshot.params.id;

      for (const row of allActions.rows) {
        await actions.get(row.id).then(async function (rowResult) {
          const data: any = rowResult;

          if (data._id === _id) {
            actData.action_type = data.name;
            actData.machineId = data.machine_id;
            const date = new Date();
            actData.actionNumber = actData.action_type.substring(0, 1) + date.getDate() + (date.getMonth() + 1) +
              date.getFullYear() + date.getHours() + date.getMinutes();

            await customers.find({
              selector: {
                kKunde: { $eq: data.kunde_id }
              }
            }).then(async function (result) {
              const customer: any = result.docs[0];

              actData.customerNumber = customer.cKundenNr;
              actData.customer = customer.cFirma;
              actData.city = customer.cPLZ + ' ' + customer.cOrt;
              actData.street = customer.cStrasse;
              actData.email = customer.cEmail;
              actData.telephone = customer.cTel;
              actData.customerId = customer._id;
            }).catch(function (err) {
              console.log('theres an error');
            });

            await workers.find({
              selector: {
                _id: { $eq: data.worker_id }
              }
            }).then(async function (result) {
              const worker: any = result.docs[0];

              actData.technicianName = worker.firstname + ' ' + worker.lastname;
            });
          }
        });
      }
    } else {
      const actionData = JSON.parse(localStorage.actionData);
      const workers = await new PouchDB('workers');
      const customers = await new PouchDB('tkunde');

      actData.action_type = actionData.actionType;
      actData.nextAction = actionData.actionDate;
      const date = new Date();
      actData.actionNumber = actData.action_type.substring(0, 1) + date.getDate() + (date.getMonth() + 1) +
        date.getFullYear() + date.getHours() + date.getMinutes();

      await workers.find({
        selector: {
          worker_id: { $eq: actionData.actionWorkerId }
        }
      }).then(async function (result) {
        const worker: any = result.docs[0];

        actData.technicianName = worker.firstname + ' ' + worker.lastname;
      });

      await customers.find({
        selector: {
          _id: { $eq: actionData.selectedCustomer }
        }
      }).then(async function (result) {
        const customer: any = result.docs[0];

        actData.customerNumber = customer.cKundenNr;
        actData.customer = customer.cFirma;
        actData.city = customer.cPLZ + ' ' + customer.cOrt;
        actData.street = customer.cStrasse;
        actData.email = customer.cEmail;
        actData.telephone = customer.cTel;
        actData.customerId = actionData.selectedCustomer;
        if (actionData.machineId) {
          actData.machineId = actionData.actionMachineId;
        }
      }).catch(function (err) {
        console.log('theres an error');
      });
    }
    console.log('ACTDATA', actData);
    this.actionData = actData;
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  async save() {
    let date = new Date();
    let done: boolean;
    const action = this.actionData;

    if (this.actionData.machineId) {
      const actions = await new PouchDB('actions');
      const machines = await new PouchDB('machines_kunde');
      const _id: string = this.route.snapshot.params.id;

      if (this.route.snapshot.params.id !== 'undefined') {
        const action_type = this.actionData.action_type;
        const machineId = this.actionData.machineId;
        await actions.find({
          selector: {
            _id: { $eq: _id }
          }
        }).then(async function (data: any) {
          const doc = data.docs[0];
          if (action_type === 'Wartung') {
            done = false;
            await machines.find({
              selector: {
                _id: { $eq: machineId }
              }
            }).then(async function (machine: any) {
              const machineDoc = machine.docs[0];

              date = new Date();
              date.setMonth(new Date().getMonth() + machineDoc.serviceInterval);

              machines.put({
                _id: machineDoc._id,
                _rev: machineDoc._rev,
                kunde_id: machineDoc.kunde_id,
                machineTyp_id: machineDoc.machineTyp_id,
                nextService: date,
                room: machineDoc.room,
                serialnumber: machineDoc.serialnumber,
                serviceInterval: machineDoc.serviceInterval
              });
            });

          } else {
            date = doc.date;
            done = true;
          }

          return actions.put({
            _id: doc._id,
            _rev: doc._rev,
            action_id: doc.action_id,
            date: date,
            done: done,
            kunde_id: doc.kunde_id,
            machine_id: doc.machine_id,
            name: doc.name,
            worker_id: doc.worker_id
          }).then(function (resp) {
            console.log(resp);
          });
        });
      } else {
        const action_type = this.actionData.action_type;
        const machineId = this.actionData.machineId;
        await actions.find({
          selector: {
            _id: { $eq: _id }
          }
        }).then(async function (data: any) {
          if (action_type === 'Wartung') {
            done = false;
            await machines.find({
              selector: {
                _id: { $eq: machineId }
              }
            }).then(async function (machine: any) {
              const machineDoc = machine.docs[0];

              date = new Date();
              date.setMonth(new Date().getMonth() + machineDoc.serviceInterval);

              machines.put({
                _id: machineDoc._id,
                _rev: machineDoc._rev,
                kunde_id: machineDoc.kunde_id,
                machineTyp_id: machineDoc.machineTyp_id,
                nextService: date,
                room: machineDoc.room,
                serialnumber: machineDoc.serialnumber,
                serviceInterval: machineDoc.serviceInterval
              });
            });

          }
        });
      }
    }
    this.savePDF();

    this.router.navigate(['/actionlist']);
  }

  getDataUri(img, multiplier) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.width * multiplier;
    canvas.height = img.height * multiplier;
    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL();
  }

  savePDF() {
    const doc = new jsPDF('p', 'mm', [this.pdfWidth, this.pdfHeight]);
    this.pdfPage = 1;
    this.focusPage = this.pdfPage.valueOf();

    let image = document.getElementById('water');
    let imgData = this.getDataUri(image, 2);
    doc.addImage(imgData, 'PNG', 5, 5, image.clientWidth / 2, image.clientHeight / 2);

    image = document.getElementById('logo');
    imgData = this.getDataUri(image, 2);
    doc.addImage(imgData, 'PNG', 120, 5, image.clientWidth / 4, image.clientHeight / 4);


    const report = `Lieferschein${this.actionData.actionNumber}`;
    const text = 'Lieferschein';
    // offset from the top of the pdf file where x in mm
    let verticalOffset = 40;
    let fontSize = 25;

    /*
     * factor 1.3 = right side
     * factor 3 = left side
     *
     */


    // set the fontSize of the document
    doc.setFontSize(fontSize);
    /*
    writes the given text in the PDF-File where the first parameter is the
    position on the x-Axis and the second parameter is the position on the y-Axis
    */
    this.setTextPDF(doc, text, verticalOffset, 2.5);


    // calculating the vertical offset by dividing the fontSize through 5 and adding 1
    // +1 = space for header, +2 = space for data in the rows, +3 = space for new row
    verticalOffset += (fontSize / 5) + 6;

    fontSize = 10;
    doc.setFontSize(fontSize);

    this.setTextPDF(doc, '4341 Arbing / Technologiestraße 3', verticalOffset, 1.5);
    verticalOffset += (fontSize / 5) + 1;
    this.setTextPDF(doc, 'Tel.: +43(0)664 221 81 08', verticalOffset, 1.5);
    verticalOffset += (fontSize / 5) + 1;
    this.setTextPDF(doc, 'Fax.: +43(0) 7238 29105', verticalOffset, 1.5);
    verticalOffset += (fontSize / 5) + 1;
    this.setTextPDF(doc, 'Mail: office@energywater.at', verticalOffset, 1.5);
    verticalOffset += (fontSize / 5) + 6;

    fontSize = 16;
    doc.setFontSize(fontSize);

    this.setTextPDF(doc, 'Service-Bericht', verticalOffset);
    this.setTextPDF(doc, 'www.energywater.at', verticalOffset, 1.5);
    verticalOffset += (fontSize / 5) + 3;

    this.setTextPDF(doc, this.actionData.action_type, verticalOffset);


    // big space between header and rows
    verticalOffset += (fontSize / 5) + 12;
    // fontsize of 10 mm
    fontSize = 10;
    doc.setFontSize(fontSize);
    this.printServiceReport(doc, verticalOffset, fontSize);

    doc.save(report + '.pdf');
  }

  printServiceReport(doc, verticalOffset: number, fontSize: number) {
    let distanceBetweenRows = 2;
    const distanceBetweenNewRows = 4;

    doc.setFontType('bold');
    this.setTextPDF(doc, 'Zu Auftr.-Nr.: ', verticalOffset);
    this.setTextPDF(doc, 'Kunde: ', verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    doc.setFontType('normal');
    this.setTextPDF(doc, this.actionData.actionNumber, verticalOffset);
    this.setTextPDF(doc, this.actionData.customer, verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenNewRows;

    doc.setFontType('bold');
    this.setTextPDF(doc, 'Kunden-Nr.: ', verticalOffset);
    this.setTextPDF(doc, 'Fahrzeug: ', verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    doc.setFontType('normal');
    this.setTextPDF(doc, this.actionData.customerNumber.toString(), verticalOffset);
    this.setTextPDF(doc, this.actionData.vehicle, verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenNewRows;

    doc.setFontType('bold');
    this.setTextPDF(doc, 'Name Techniker:', verticalOffset);
    this.setTextPDF(doc, 'Straße, Nr.: ', verticalOffset, 1.8);
    this.setTextPDF(doc, 'PLZ, Ort.: ', verticalOffset, 1.3);
    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    doc.setFontType('normal');
    this.setTextPDF(doc, this.actionData.technicianName, verticalOffset);
    this.setTextPDF(doc, this.actionData.street, verticalOffset, 1.8);
    this.setTextPDF(doc, this.actionData.city, verticalOffset, 1.3);
    verticalOffset += (fontSize / 5) + distanceBetweenNewRows;

    doc.setFontType('bold');
    this.setTextPDF(doc, 'Anfahrt: ', verticalOffset);
    this.setTextPDF(doc, 'Abfahrt: ', verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    doc.setFontType('normal');
    this.setTextPDF(doc, this.actionData.approach + 'h', verticalOffset);
    this.setTextPDF(doc, this.actionData.departure + 'h', verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenNewRows;

    doc.setFontType('bold');
    this.setTextPDF(doc, 'Ansprechpartner: ', verticalOffset);
    this.setTextPDF(doc, 'Arbeitszeit: ', verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    doc.setFontType('normal');
    this.setTextPDF(doc, this.actionData.partner, verticalOffset);
    this.setTextPDF(doc, this.actionData.timeForWork + 'h', verticalOffset, 1.8);
    verticalOffset += (fontSize / 5) + distanceBetweenNewRows;

    doc.setFontType('bold');

    this.setTextPDF(doc, 'Gefahrene Kilometer:', verticalOffset);
    this.setTextPDF(doc, 'Telefon: ', verticalOffset, 1.8);
    this.setTextPDF(doc, 'Email: ', verticalOffset, 1.3);
    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);

    doc.setFontType('normal');
    this.setTextPDF(doc, this.actionData.distance.toString(), verticalOffset);
    this.setTextPDF(doc, this.actionData.telephone, verticalOffset, 1.8);
    this.setTextPDF(doc, this.actionData.email, verticalOffset, 1.3);
    verticalOffset += (fontSize / 5) + 6;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);



    doc.setFontSize(13);
    this.setTextPDF(doc, 'Gerät/Serien-Nr., Standort oder Reparaturbericht', verticalOffset);
    this.setTextPDF(doc, 'Wartungsarbeiten', verticalOffset, 1.8);
    this.setTextPDF(doc, 'Gerät/Serien-Nr.', verticalOffset, 1.3);
    verticalOffset += (fontSize / 5) + distanceBetweenNewRows;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);
    let tempVerticalOffset = verticalOffset.valueOf();
    doc.setFontSize(fontSize);


    // print service report "Wartungsarbeiten"
    distanceBetweenRows = 1;
    for (let i = 0; i < this.differentWorkingTypes.length; i++) {
      const name = this.differentWorkingTypes[i][0];
      const checked = this.differentWorkingTypes[i][1];
      verticalOffset = this.printServiceWorkTable(doc, name,
        checked, verticalOffset, fontSize, distanceBetweenRows);
    }

    this.setTextPDF(doc, this.mark.name, verticalOffset, 1.8);
    this.setTextPDF(doc, this.mark.number, verticalOffset, 1.3);
    verticalOffset += (fontSize / 5) + 6;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);


    doc.setFontSize(14);
    this.setTextPDF(doc, 'Menge', verticalOffset, 1.8);
    this.setTextPDF(doc, 'Artikel-Nr.', verticalOffset, 1.5);
    this.setTextPDF(doc, 'Bezeichnung', verticalOffset, 1.2);
    doc.setFontSize(fontSize);

    verticalOffset += (fontSize / 5) + distanceBetweenNewRows;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);


    // print "Menge, Artikel, Bezeichung" table
    this.printMABTable(doc, verticalOffset, distanceBetweenRows, fontSize);

    if (this.focusPage < this.pdfPage) {
      doc.setPage(this.focusPage);
      this.focusPage = this.pdfPage.valueOf();
    }

    // print geräte table
    tempVerticalOffset = this.printDeviceReport(doc, tempVerticalOffset, distanceBetweenNewRows, fontSize);

    this.setTextPDF(doc, 'Nächste Wartung: ' + this.dateLater.toLocaleDateString(), tempVerticalOffset);

    const img = this.signaturePad.toDataURL();

    doc.setPage(this.pdfPage);
    const imgWidth = 50;
    const imgHeigth = 20;

    const image = document.getElementById('signature');
    const imgData = this.getDataUri(image, 3);
    doc.addImage(imgData, 'PNG', this.pdfWidth - ((image.clientWidth / 5) + 80), this.pdfHeight - ((image.clientHeight / 5) + 10),
      image.clientWidth / 5, image.clientHeight / 5);

    doc.addImage(img, 'PNG', this.pdfWidth - (imgWidth + 10), this.pdfHeight - (imgHeigth + 10), imgWidth, imgHeigth);

    this.setTextPDF(doc, 'Datum: ' + this.date.toLocaleDateString(), this.pdfHeight - 10);
  }

  // check if the text to print is small enough for the provided space
  checkHorizontalOffsetPDF(text: string, providedLength: number) {
    let textArr: string[] = [];
    const returnArr: string[] = [];
    const length: number = textArr.length;

    textArr = text.split(' ');

    // as long as there is text to print, it will be iterated
    for (let i = 0; 0 < textArr.length; i++) {

      // if the start length of the textArr equals 1 and the length of the text is less than
      // the 'provided length' the returnArr gets the Value of the textArr
      if (length === 1 && textArr[i].length < providedLength) {
        // if the returnArr is set on this position where i is the position, it will be added, else it will be set to a new value
        if (returnArr[i]) {
          returnArr[i] += textArr.shift();
        } else {
          returnArr[i] = textArr.shift();
        }
        // if the length of the text is greater than the length of the 'provided space' => the text has to be splitted
      } else if (textArr[0].length > providedLength) {
        let substringStart = 0;                                             // start index for cutting the string
        let substringEnd: number = providedLength;                                  // end index for cutting the string
        const splitter: number = Math.floor(textArr[0].length / providedLength) + 1;  // number of times the text has to be splitted

        for (let j = 0; j < splitter; j++) {
          returnArr.push(textArr[0].substring(substringStart, substringEnd));
          substringStart += providedLength;
          substringEnd += providedLength;
        }
        textArr.shift();
      } else {
        // if the returnArr is not set on the index 'i', it will be set to the text of the array
        if (!returnArr[i]) {
          returnArr[i] = textArr.shift();
          // if the first element of the array is undefined, the loop will be stopped
          if (!textArr[0]) {
            break;
          }
        }

        i = returnArr.length - 1;
        // while the length text array and the return array added, is less than the provided length
        // the text will be added to the return array
        while ((textArr[0].length + returnArr[i].length) < providedLength) {
          returnArr[i] += ' ' + textArr.shift();

          if (!textArr[0]) {
            break;
          }
        }
      }
    }

    return returnArr;
  }

  printMABTable(doc, verticalOffset: number, distanceBetweenRows: number, fontSize: number) {
    const rowData = this.rowsWart;
    const providedLength = 10;
    for (let i = 0; i < rowData.length; i++) {
      const tempVerticalOffset = verticalOffset.valueOf();

      verticalOffset = this.printCellsInMABTable(doc, distanceBetweenRows, rowData[i][0].toString(),
        providedLength, 1.8, tempVerticalOffset);
      verticalOffset = this.printCellsInMABTable(doc, distanceBetweenRows, rowData[i][1].toString(),
        providedLength, 1.5, tempVerticalOffset);
      verticalOffset = this.printCellsInMABTable(doc, distanceBetweenRows, rowData[i][2], providedLength, 1.2, tempVerticalOffset);

      doc.line((this.pdfWidth / 1.8), verticalOffset, this.pdfWidth, verticalOffset);

      verticalOffset += (fontSize / 5) + distanceBetweenRows;
      verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);
    }
  }

  printCellsInMABTable(doc, distanceBetweenRows: number, text: string, providedLength: number,
    horizontalOffset: number, verticalOffset: number) {

    let name: string[] = [];
    // check the horizontal offset only if the name is longer than the space
    if (text.length > providedLength) {
      name = this.checkHorizontalOffsetPDF(text, providedLength);
    } else {
      name.push(text);
    }
    for (let j = 0; j < name.length; j++) {
      this.setTextPDF(doc, `${name[j]}`, verticalOffset, horizontalOffset);
      if (name.length > 1 && j < name.length - 1) {
        verticalOffset += (doc.internal.getFontSize() / 5) + distanceBetweenRows;
        const newVerticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);
        console.log(newVerticalOffset, verticalOffset);
        if (newVerticalOffset < verticalOffset) {
          verticalOffset = newVerticalOffset;

        }
      }
    }

    return verticalOffset;
  }

  printServiceWorkTable(doc, text, checked, verticalOffset: number, fontSize: number, distanceBetweenRows: number) {
    let name: string[] = [];
    // providedLength is the provided space for the certain text in the PDF
    const providedLength = 25;

    // check the horizontal offset only if the name is longer than the space
    if (text.length > providedLength) {
      name = this.checkHorizontalOffsetPDF(text, providedLength);
    } else {
      name.push(text);
    }
    for (let j = 0; j < name.length; j++) {
      this.setTextPDF(doc, `${name[j]}`, verticalOffset, 1.8);
      if (name.length > 1 && j < name.length - 1) {
        verticalOffset += (doc.internal.getFontSize() / 5) + distanceBetweenRows;
        verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);
      }
    }

    if (checked) {
      text = 'durchgeführt';
    } else {
      text = 'nicht durchgeführt';
    }
    this.setTextPDF(doc, text, verticalOffset, 1.3);
    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);

    doc.line((this.pdfWidth / 1.8), verticalOffset, this.pdfWidth, verticalOffset);

    verticalOffset += (doc.internal.getFontSize() / 5) + distanceBetweenRows;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);

    return verticalOffset;
  }

  printDeviceReport(doc, verticalOffset: number, distanceBetweenRows: number, fontSize: number) {
    const providedLength = 50;

    for (let i = 0; i < this.rowsGer.length; i++) {
      doc.setFontType('bold');
      verticalOffset = this.printCellsInDeviceReport(doc, 'Seriennummer:', verticalOffset, fontSize, distanceBetweenRows,
        providedLength);
      doc.setFontType('normal');
      verticalOffset = this.printCellsInDeviceReport(doc, this.rowsGer[i][0], verticalOffset, fontSize, distanceBetweenRows,
        providedLength);
      doc.setFontType('bold');
      verticalOffset = this.printCellsInDeviceReport(doc, 'Standort:', verticalOffset, fontSize, distanceBetweenRows,
        providedLength);
      doc.setFontType('normal');
      verticalOffset = this.printCellsInDeviceReport(doc, this.rowsGer[i][1], verticalOffset, fontSize, distanceBetweenRows,
        providedLength);
      doc.setFontType('bold');
      verticalOffset = this.printCellsInDeviceReport(doc, 'Reparaturbericht:', verticalOffset, fontSize, distanceBetweenRows,
        providedLength);
      doc.setFontType('normal');
      verticalOffset = this.printCellsInDeviceReport(doc, this.rowsGer[i][2], verticalOffset, fontSize, distanceBetweenRows,
        providedLength);

      doc.line(10, verticalOffset, (this.pdfWidth / 1.9), verticalOffset);
      console.log(this.focusPage);
      verticalOffset += (fontSize / 5) + distanceBetweenRows;
      verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);
    }
    return verticalOffset;
  }

  printCellsInDeviceReport(doc, text: string, verticalOffset: number, fontSize: number, distanceBetweenRows: number,
    providedLength: number) {

    let name: string[] = [];
    // check the horizontal offset only if the name is longer than the space
    if (text.length > providedLength) {
      name = this.checkHorizontalOffsetPDF(text, providedLength);
    } else {
      name.push(text);
    }
    for (let j = 0; j < name.length; j++) {
      this.setTextPDF(doc, `${name[j]}`, verticalOffset);
      if (name.length > 1 && j < name.length - 1) {
        verticalOffset += (doc.internal.getFontSize() / 5) + distanceBetweenRows;
        verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);
      }
    }

    verticalOffset += (fontSize / 5) + distanceBetweenRows;
    verticalOffset = this.checkVerticalOffsetPDF(verticalOffset, doc);
    console.log(this.focusPage, this.pdfPage);

    return verticalOffset;
  }


  // calculates the horizontal offset for the given text and factor
  getHorizontalAlignOffset(text: string, doc, factor: number) {
    if (text) {
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      return (this.pdfWidth) / factor;
    }
  }

  // check if the vertical offset is smaller than the page itself, if not add a new page to the document and set the offset to the default
  checkVerticalOffsetPDF(verticalOffset: number, doc) {
    if ((verticalOffset < this.pdfHeight - 20 && verticalOffset > this.pdfHeight - 30) || verticalOffset > this.pdfHeight) {
      if (this.pdfPage > this.focusPage) {
        this.focusPage++;
        doc.setPage(this.focusPage);
      } else {
        doc.addPage();
        this.pdfPage++;
      }
      verticalOffset = 10;
    }
    return verticalOffset;
  }

  // prints the given text in the PDF-Document
  setTextPDF(doc, text: string, verticalOffset: number, factor: number = 0) {
    if (text) {
      // if the factor is 0 the text will be printed on x = 10 (Row Header)
      if (factor === 0) {
        doc.text(10, verticalOffset, text);
      } else {
        doc.text(this.getHorizontalAlignOffset(text, doc, factor), verticalOffset, text);
      }
    }
  }
}
