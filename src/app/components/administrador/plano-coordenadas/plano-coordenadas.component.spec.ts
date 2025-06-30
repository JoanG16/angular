import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanoCoordenadasComponent } from './plano-coordenadas.component';

describe('PlanoCoordenadasComponent', () => {
  let component: PlanoCoordenadasComponent;
  let fixture: ComponentFixture<PlanoCoordenadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanoCoordenadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanoCoordenadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
