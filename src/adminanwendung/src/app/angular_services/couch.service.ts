import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AUTHENTICATION } from '../globals';

@Injectable({
  providedIn: 'root'
})
export class CouchService {

  httpOptions: { headers};
  url: string;

  constructor(private httpClient: HttpClient) {
    this.url = localStorage.getItem('serverLink');
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': AUTHENTICATION
      })
    };
  }

  doGet(type: string) {
    return this.httpClient.get(this.url + '/' + type, this.httpOptions);
  }

  doGetAllDocs(type: string) {
    return this.httpClient.get(this.url + '/' + type + '/_all_docs', this.httpOptions);
  }

  doPost(type: string, data: any) {
    return this.httpClient.post(this.url + '/' + type, data, this.httpOptions);
  }

  doDelete(tableName: string, id: string, _rev: string) {
    return this.httpClient.delete(this.url + tableName + '/' + id + '?rev=' + _rev, this.httpOptions);
  }

  doPut(tableName: string, object: any) {
    return this.httpClient.put(this.url + tableName + '/' + object._id, object, this.httpOptions);
  }

  getCustomer(id: number) {
    const selector = {
      'selector': {
        'kKunde': {'$eq': id.toString()}
      },
      'fields': ['kKunde', 'cFirma', 'cZusatz']
    };

    return new Promise((resolve, rejcet) => {
      this.doPost('tkunde/_find', selector).subscribe((resp: any) => {
        resp.docs[0].kKunde = parseInt(resp.docs[0].kKunde, 10);
        resolve(resp);
      });
    });
  }

  getMachine(id: string) {
    return new Promise((resolve, reject) => {
      this.doGet('machines_kunde/' + id).subscribe(resp => {
        resolve(resp);
      });
    });
  }

  getDocument(id: string, type: string) {
    return this.httpClient.get(this.url + '/' + type + '/' + id, this.httpOptions);
  }

  getWorker(id: string) {
    return new Promise((resolve, reject) => {
      this.doGet('workers/' + id).subscribe(resp => {
        resolve(resp);
      });
    });
  }

  getMachineType(id: string) {
    return new Promise((resolve, reject) => {
      this.doGet('machines/' + id).subscribe(resp => {
        resolve(resp);
      });
    });
  }
}
