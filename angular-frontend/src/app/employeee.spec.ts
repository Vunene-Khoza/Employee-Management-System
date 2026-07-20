import { TestBed } from '@angular/core/testing';

import { Employeee } from './employeee';

describe('Employeee', () => {
  let service: Employeee;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Employeee);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
