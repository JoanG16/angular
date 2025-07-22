import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ProductoService } from '../../../../services/administrador/producto.service';
import { CategoriaService } from '../../../../services/administrador/categoria.service';
import { LocalesService } from '../../../../services/administrador/locales.service';

import { Producto } from '../../../../interfaces/producto.interface';
import { Categoria } from '../../../../interfaces/categoria.interface';
import { Local } from '../../../../interfaces/locales.interface'; // Importar LocalResponse

import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { SelectLocalesDialogComponent } from '../../select-locales-dialog/select-locales-dialog/select-locales-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, SelectLocalesDialogComponent],
  templateUrl: './producto-crud.component.html',
  styleUrls: ['./producto-crud.component.css']
})
export class ProductoCrudComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  allLocales: Local[] = []; // Todos los locales disponibles

  // Formulario
  productoSeleccionado: Producto | null = null;
  nombre: string = '';
  descripcion_adicional: string = '';
  id_categoria: number | null = null;
  localesSeleccionados: number[] = []; // Array de IDs de locales seleccionados

  isEditing: boolean = false;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private localService: LocalesService,
    private dialog: MatDialog,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarLocales(); // Cargar todos los locales al inicio
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.getAllProductos().subscribe({
      next: (data) => {
        this.productos = data;
        console.log('Categorías asignadas al componente (producto-crud):', this.productos);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar los productos.');
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getAllCategorias().subscribe({
      next: (data: Categoria[]) => { // Esperamos directamente un array de Categoria[]
        console.log('Categorías recibidas del servicio (producto-crud):', data); // LOG de depuración
        this.categorias = data; // Asignar los datos al array del componente
        console.log('Categorías asignadas al componente (producto-crud):', this.categorias); // LOG de depuración
      },
      error: (err) => {
        console.error('Error al cargar categorías (producto-crud):', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar las categorías.');
      }
    });
  }

  cargarLocales(): void {
    // El servicio ahora devuelve Local[] directamente
    this.localService.getAllLocales().subscribe({
      next: (data: Local[]) => { // data es directamente Local[]
        this.allLocales = data;
      },
      error: (err) => {
        console.error('Error al cargar locales:', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar los locales.');
      }
    });
  }

  // Métodos de utilidad para el template
  getCategoriaNombre(id_categoria: number | undefined): string {
    if (id_categoria === undefined || id_categoria === null) return 'N/A';
    const categoria = this.categorias.find(c => c.id_categoria === id_categoria);
    return categoria ? categoria.nombre_categoria : 'Desconocida';
  }

  getNombreLocalParaChip(localId: number): string {
    const local = this.allLocales.find(l => l.id_local === localId);
    return local ? local.nombre_del_negocio : 'Local Desconocido';
  }

  getLocalesNombresParaTabla(locales?: Local[]): string {
    if (!locales || locales.length === 0) return 'N/A';
    return locales.map(l => l.nombre_del_negocio).join(', ');
  }

  guardarOActualizarProducto(): void {
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

    if (this.isEditing && this.productoSeleccionado) {
      this.productoService.updateProducto(this.productoSeleccionado.id_producto, payload).subscribe({
        next: () => {
          this.mostrarMensajeExito('Producto actualizado correctamente.');
          this.resetForm();
          this.cargarProductos();
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          this.mostrarMensajeError('Error al Actualizar', 'Hubo un error al actualizar el producto: ' + (err.error?.message || 'Error desconocido.'));
        }
      });
    } else {
      this.productoService.createProducto(payload).subscribe({
        next: () => {
          this.mostrarMensajeExito('Producto creado correctamente.');
          this.resetForm();
          this.cargarProductos();
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
          this.mostrarMensajeError('Error al Crear', 'Hubo un error al crear el producto: ' + (err.error?.message || 'Error desconocido.'));
        }
      });
    }
  }

  seleccionarProductoParaEditar(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.isEditing = true;

    this.nombre = producto.nombre;

    this.descripcion_adicional = producto.descripcion_adicional || '';
    this.id_categoria = producto.id_categoria;
    this.localesSeleccionados = producto.locales ? producto.locales.map(l => l.id_local) : [];
  }

  eliminarProducto(producto: Producto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar',
        isDanger: true
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.productoService.deleteProducto(producto.id_producto).subscribe({
          next: () => {
            this.mostrarMensajeExito('Producto eliminado correctamente.');
            this.cargarProductos();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error al eliminar producto:', err);
            this.mostrarMensajeError('Error al Eliminar', 'Hubo un error al eliminar el producto: ' + (err.error?.message || 'Error desconocido.'));
          }
        });
      }
    });
  }

  resetForm(): void {
    this.nombre = '';
    this.descripcion_adicional = '';
    this.id_categoria = null;
    this.localesSeleccionados = [];
    this.productoSeleccionado = null;
    this.isEditing = false;
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
   irAPagina(titulo: string): void {
    this.router.navigate([titulo])

  }
}
