import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaContenedoresComponent } from './mapa-contenedores.component';

describe('MapaContenedoresComponent', () => {
  let component: MapaContenedoresComponent;
  let fixture: ComponentFixture<MapaContenedoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaContenedoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaContenedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
