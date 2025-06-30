import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLocalesDialogComponent } from './select-locales-dialog.component';

describe('SelectLocalesDialogComponent', () => {
  let component: SelectLocalesDialogComponent;
  let fixture: ComponentFixture<SelectLocalesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLocalesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectLocalesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
