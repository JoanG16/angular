import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ProductoService } from '../../../services/administrador/producto.service';
import { CategoriaService } from '../../../services/administrador/categoria.service';
import { LocalesService } from '../../../services/page/locales.service';

import { Producto } from '../../../interfaces/producto.interface';
import { Categoria } from '../../../interfaces/categoria.interface';
import { Local } from '../../../interfaces/locales.interface';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { SelectLocalesDialogComponent } from '../select-locales-dialog/select-locales-dialog/select-locales-dialog.component';
import { MatDialog } from '@angular/material/dialog'; // Importar MatDialog aquí también

@Component({
  selector: 'app-edit-producto-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, SelectLocalesDialogComponent],
  templateUrl: './edit-producto-dialog.component.html',
  styleUrls: ['./edit-producto-dialog.component.css']
})
export class EditProductoDialogComponent implements OnInit {
  // Propiedades del formulario de edición
  productoAEditar: Producto;
  nombre: string = '';
  descripcion_adicional: string = '';
  id_categoria: number | null = null;
  localesSeleccionados: number[] = [];

  categorias: Categoria[] = [];
  allLocales: Local[] = []; // Todos los locales disponibles

  constructor(
    public dialogRef: MatDialogRef<EditProductoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { producto: Producto },
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private localService: LocalesService,
    private dialog: MatDialog // Inyectar MatDialog para abrir SelectLocalesDialog
  ) {
    this.productoAEditar = { ...data.producto }; // Crear una copia para evitar mutar el objeto original directamente
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarLocales();
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.nombre = this.productoAEditar.nombre;
    this.descripcion_adicional = this.productoAEditar.descripcion_adicional || '';
    this.id_categoria = this.productoAEditar.id_categoria;
    this.localesSeleccionados = this.productoAEditar.locales ? this.productoAEditar.locales.map(l => l.id_local) : [];
  }

  cargarCategorias(): void {
    this.categoriaService.getAllCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías en el diálogo:', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar las categorías.');
      }
    });
  }

  cargarLocales(): void {
    this.localService.getAllLocales().subscribe({
      next: (data: Local[]) => {
        this.allLocales = data;
      },
      error: (err) => {
        console.error('Error al cargar locales en el diálogo:', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar los locales.');
      }
    });
  }

  getNombreLocalParaChip(localId: number): string {
    const local = this.allLocales.find(l => l.id_local === localId);
    return local ? local.nombre_del_negocio : 'Local Desconocido';
  }

  openSelectLocalesDialog(): void {
    const dialogRef = this.dialog.open(SelectLocalesDialogComponent, {
      width: '600px',
      data: {
        locales: this.allLocales,
        selectedLocalIds: this.localesSeleccionados
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.localesSeleccionados = result;
      }
    });
  }

  guardarCambios(): void {
    if (!this.nombre || this.id_categoria === null || this.localesSeleccionados.length === 0) {
      this.mostrarMensajeError('Campos Incompletos', 'Por favor, completa todos los campos obligatorios (Nombre, Categoría, Locales).');
      return;
    }

    const payload = {
      nombre: this.nombre,
      descripcion_adicional: this.descripcion_adicional,
      id_categoria: this.id_categoria,
      locales: this.localesSeleccionados // IDs de locales
    };

    this.productoService.updateProducto(this.productoAEditar.id_producto, payload).subscribe({
      next: (updatedProduct) => {
        this.mostrarMensajeExito('Producto actualizado correctamente.');
        this.dialogRef.close(updatedProduct); // Cierra el diálogo y pasa el producto actualizado
      },
      error: (err) => {
        console.error('Error al actualizar producto en el diálogo:', err);
        this.mostrarMensajeError('Error al Actualizar', 'Hubo un error al actualizar el producto: ' + (err.error?.message || 'Error desconocido.'));
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(null); // Cierra el diálogo sin pasar ningún dato (indica cancelación)
  }

  private mostrarMensajeExito(message: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Éxito',
        message: message,
        confirmButtonText: 'Aceptar',
        hideCancelButton: true
      }
    });
  }

  private mostrarMensajeError(title: string, message: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: title,
        message: message,
        confirmButtonText: 'Cerrar',
        isDanger: true,
        hideCancelButton: true
      }
    });
  }
}
