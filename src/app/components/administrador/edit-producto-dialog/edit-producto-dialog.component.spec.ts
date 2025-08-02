import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductoDialogComponent } from './edit-producto-dialog.component';

describe('EditProductoDialogComponent', () => {
  let component: EditProductoDialogComponent;
  let fixture: ComponentFixture<EditProductoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProductoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProductoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
