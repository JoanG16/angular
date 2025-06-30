import { TestBed } from '@angular/core/testing';

import { ContenedoresService } from './contenedores.service';

describe('ContenedoresService', () => {
  let service: ContenedoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContenedoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
