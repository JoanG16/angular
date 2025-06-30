import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleLocalComponent } from './detalle-local.component';

describe('DetalleLocalComponent', () => {
  let component: DetalleLocalComponent;
  let fixture: ComponentFixture<DetalleLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleLocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
