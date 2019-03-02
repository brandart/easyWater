import { Injectable } from '@angular/core';
import { Sort } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SortingService {

  constructor() { }


  sortData(sortEvent: Sort, toSortData): any[] {
    const isAsc = sortEvent.direction === 'asc';

    if (sortEvent.direction === '') {
      return toSortData;
    }

    const sortedData = toSortData.sort((a: any, b: any) => {
      switch (sortEvent.active) {
        case 'customer': return this.compare(a.cutomer, b.customer, isAsc);
        case 'date': return this.compare(a.date, b.date, isAsc);
        default: return 0;
      }
    });

    return sortedData;
  }

  compare(a, b, isAsc) {
    if (!a) {
      return 1;
    } else if (!b) {
      return -1;
    }

    if (!isNaN(Date.parse(a)) && !isNaN(Date.parse(b))) {
      return (new Date(a).getTime() < new Date(b).getTime() ? -1 : 1) * (isAsc ? 1 : -1);
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a.toLowerCase().localeCompare(b.toLowerCase()) * (isAsc ? 1 : -1);
    }
  }
}
