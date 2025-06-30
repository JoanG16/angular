import { TestBed } from '@angular/core/testing';

import { MapaContenedoresService } from './mapa-contenedores.service';

describe('MapaContenedoresService', () => {
  let service: MapaContenedoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapaContenedoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
