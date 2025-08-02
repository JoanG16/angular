import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog'; // Importar MatDialog

import { ProductoService } from '../../../../services/administrador/producto.service';
import { CategoriaService } from '../../../../services/administrador/categoria.service';
import { LocalesService } from '../../../../services/administrador/locales.service';

import { Producto } from '../../../../interfaces/producto.interface';
import { Categoria } from '../../../../interfaces/categoria.interface';
import { Local } from '../../../../interfaces/locales.interface';

import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { SelectLocalesDialogComponent } from '../../select-locales-dialog/select-locales-dialog/select-locales-dialog.component';
import { EditProductoDialogComponent } from '../../edit-producto-dialog/edit-producto-dialog.component'; // Importar el nuevo diálogo de edición
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
  filteredProductos: Producto[] = []; // Nueva lista para productos filtrados
  categorias: Categoria[] = [];
  allLocales: Local[] = []; // Todos los locales disponibles

  // Propiedades para el formulario de CREACIÓN (el de edición se mueve al modal)
  nombre: string = '';
  descripcion_adicional: string = '';
  id_categoria: number | null = null;
  localesSeleccionados: number[] = []; // Array de IDs de locales seleccionados para el formulario de creación

  searchTerm: string = ''; // Nuevo: para el buscador

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private localService: LocalesService,
    private dialog: MatDialog, // Inyectar MatDialog
    private router:Router
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarLocales();
    this.cargarProductos();
  }

  // Carga todos los productos y aplica el filtro inicial
  cargarProductos(): void {
    this.productoService.getAllProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.applyProductFilter(); // Aplicar filtro inicial al cargar productos
        console.log('Productos cargados (producto-crud):', this.productos);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar los productos.');
      }
    });
  }

  // Carga todas las categorías disponibles
  cargarCategorias(): void {
    this.categoriaService.getAllCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        console.log('Categorías asignadas al componente (producto-crud):', this.categorias);
      },
      error: (err) => {
        console.error('Error al cargar categorías (producto-crud):', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar las categorías.');
      }
    });
  }

  // Carga todos los locales disponibles
  cargarLocales(): void {
    this.localService.getAllLocales().subscribe({
      next: (data: Local[]) => {
        this.allLocales = data;
      },
      error: (err) => {
        console.error('Error al cargar locales:', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar los locales.');
      }
    });
  }

  // Nuevo método para filtrar productos por nombre
  applyProductFilter(): void {
    const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
    if (lowerSearchTerm) {
      this.filteredProductos = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(lowerSearchTerm)
      );
    } else {
      this.filteredProductos = [...this.productos]; // Mostrar todos si no hay término de búsqueda
    }
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

  // Método para crear un nuevo producto (antes era guardarOActualizarProducto)
  crearProducto(): void {
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

    this.productoService.createProducto(payload).subscribe({
      next: () => {
        this.mostrarMensajeExito('Producto creado correctamente.');
        this.resetForm(); // Resetear solo el formulario de creación
        this.cargarProductos(); // Recargar la lista para ver el nuevo producto
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.mostrarMensajeError('Error al Crear', 'Hubo un error al crear el producto: ' + (err.error?.message || 'Error desconocido.'));
      }
    });
  }

  // Nuevo método para abrir el modal de edición
  openEditProductoDialog(producto: Producto): void {
    const dialogRef = this.dialog.open(EditProductoDialogComponent, {
      width: '650px', // Ancho del modal de edición
      data: { producto: producto } // Pasa el producto seleccionado al modal
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el diálogo devuelve un resultado (producto actualizado), recarga los productos
        this.cargarProductos();
      }
    });
  }

  // Elimina un producto
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
            this.cargarProductos(); // Recargar la lista después de eliminar
            this.resetForm(); // Resetear el formulario de creación si estaba en uso
          },
          error: (err) => {
            console.error('Error al eliminar producto:', err);
            this.mostrarMensajeError('Error al Eliminar', 'Hubo un error al eliminar el producto: ' + (err.error?.message || 'Error desconocido.'));
          }
        });
      }
    });
  }

  // Resetea solo el formulario de creación
  resetForm(): void {
    this.nombre = '';
    this.descripcion_adicional = '';
    this.id_categoria = null;
    this.localesSeleccionados = [];
  }

  // Abre el diálogo para seleccionar locales para el formulario de creación
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

  // Muestra un mensaje de éxito usando el diálogo de confirmación
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

  // Muestra un mensaje de error usando el diálogo de confirmación
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
  
  // Navega a otras páginas de la aplicación
  irAPagina(titulo: string): void {
    this.router.navigate([titulo])
  }
}
