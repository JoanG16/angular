import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComerciantesComponent } from './comerciantes.component';

describe('ComerciantesComponent', () => {
  let component: ComerciantesComponent;
  let fixture: ComponentFixture<ComerciantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComerciantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComerciantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
