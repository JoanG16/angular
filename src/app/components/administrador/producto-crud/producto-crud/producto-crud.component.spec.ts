import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoCrudComponent } from './producto-crud.component';

describe('ProductoCrudComponent', () => {
  let component: ProductoCrudComponent;
  let fixture: ComponentFixture<ProductoCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
