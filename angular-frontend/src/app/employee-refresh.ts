import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeRefresh {
  private refreshSubject = new ReplaySubject<void>(1);
  refresh$ = this.refreshSubject.asObservable();

  trigger(): void {
    this.refreshSubject.next();
  }
}
