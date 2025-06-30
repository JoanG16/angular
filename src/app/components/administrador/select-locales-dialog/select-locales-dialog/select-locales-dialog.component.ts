import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';

import { Local } from '../../../../interfaces/locales.interface';
import { MatCheckboxChange } from '@angular/material/checkbox'; // Importar MatCheckboxChange

@Component({
  selector: 'app-select-locales-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule
  ],
  templateUrl: './select-locales-dialog.component.html',
  styleUrls: ['./select-locales-dialog.component.css']
})
export class SelectLocalesDialogComponent implements OnInit {
  allLocales: Local[] = [];
  filteredLocales: Local[] = [];
  searchText: string = '';
  selectedLocalIds: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectLocalesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      locales: Local[],
      selectedLocalIds: number[]
    }
  ) {
    this.allLocales = data.locales;
    this.selectedLocalIds = [...data.selectedLocalIds];
  }

  ngOnInit(): void {
    this.filterLocales();
  }

  filterLocales(): void {
    const lowerCaseSearchText = this.searchText.toLowerCase();
    this.filteredLocales = this.allLocales.filter(local =>
      local.nombre_del_negocio.toLowerCase().includes(lowerCaseSearchText) ||
      local.codigo_local.toLowerCase().includes(lowerCaseSearchText)
    );
  }

  // CAMBIO: Aceptar MatCheckboxChange y usar event.checked
  toggleLocalSelection(localId: number, event: MatCheckboxChange): void {
    if (event.checked) {
      this.selectedLocalIds.push(localId);
    } else {
      this.selectedLocalIds = this.selectedLocalIds.filter(id => id !== localId);
    }
  }

  isSelected(localId: number): boolean {
    return this.selectedLocalIds.includes(localId);
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedLocalIds);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}