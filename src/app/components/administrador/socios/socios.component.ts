import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { SociosService } from '../../../services/administrador/socios.service';
import { Socio } from '../../../interfaces/socio.interface';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component'; // Asegúrate de la ruta
import { Router } from '@angular/router';

@Component({
  selector: 'app-socios',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './socios.component.html',
  styleUrl: './socios.component.css'
})
export class SociosComponent implements OnInit {
  allSocios: Socio[] = []; // Almacena todos los socios sin filtrar
  socios: Socio[] = [];     // Almacena los socios actualmente mostrados (filtrados)

  // Propiedades para la funcionalidad del formulario (crear/editar)
  mostrarFormulario: boolean = false;
  socioSeleccionado: Socio | null = null;
  nuevoSocio: Socio = {
    id_socio: 0, // Se autoincrementa en backend, pero inicializamos
    nombres: '',
    apellido: '',
    telefono: '',
    correo: '',
    creado_en: new Date()
  };

  menuOpen: boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  // PROPIEDAD PARA EL FILTRO DE BÚSQUEDA
  filterNombreSocio: string = ''; // Para el input de búsqueda por nombre

  constructor(
    private sociosService: SociosService,
    private dialog: MatDialog,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.getSociosData(); // Carga inicial de socios
  }

  getSociosData(): void {
    this.sociosService.getAllSocios().subscribe({
      next: (data: Socio[]) => { // El servicio ya mapea a Socio[]
        this.allSocios = data;
        this.applyFilters(); // Aplica los filtros después de obtener nuevos datos
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al obtener socios:', err);
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error al cargar',
            message: 'Error al cargar los socios. Por favor, intenta de nuevo más tarde. Detalle: ' + (err.error?.message || err.message),
            confirmButtonText: 'Aceptar',
            hideCancelButton: true
          }
        });
      }
    });
  }

  // MÉTODO PARA APLICAR EL FILTRO
  applyFilters(): void {
    let filtered = [...this.allSocios]; // Empezamos con una copia de todos los socios

    // Filtrar por Nombre de Socio (nombres o apellido)
    if (this.filterNombreSocio) {
      const searchTerm = this.filterNombreSocio.toLowerCase().trim();
      filtered = filtered.filter(socio =>
        socio.nombres.toLowerCase().includes(searchTerm) ||
        socio.apellido.toLowerCase().includes(searchTerm)
      );
    }

    this.socios = filtered; // Actualizar la lista que se muestra en la tabla
  }

  abrirFormularioCrear(): void {
    this.socioSeleccionado = null; // No estamos editando
    this.nuevoSocio = { // Resetear el formulario para un nuevo socio
      id_socio: 0,
      nombres: '',
      apellido: '',
      telefono: '',
      correo: '',
      creado_en: new Date()
    };
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(socio: Socio): void {
    this.socioSeleccionado = { ...socio }; // Crea una copia para no modificar directamente el objeto de la tabla
    this.nuevoSocio = { ...socio }; // Carga los datos del socio en el formulario
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.socioSeleccionado = null;
    this.nuevoSocio = { // Resetear el formulario
      id_socio: 0,
      nombres: '',
      apellido: '',
      telefono: '',
      correo: '',
      creado_en: new Date()
    };
  }

  guardarSocio(): void {
    let dialogMessage: string;
    let successMessage: string;
    let errorMessage: string;
    let operation: Observable<Socio>;

    // Creamos una copia del objeto para enviar al backend
    const socioToSave: Partial<Socio> = { ...this.nuevoSocio };

    if (this.socioSeleccionado && this.socioSeleccionado.id_socio) {
      // Editando un socio existente
      dialogMessage = `¿Estás seguro de que quieres guardar los cambios para el socio "${this.nuevoSocio.nombres} ${this.nuevoSocio.apellido}"?`;
      successMessage = 'Socio actualizado correctamente.';
      errorMessage = 'Error al actualizar socio.';
      operation = this.sociosService.updateSocio(this.socioSeleccionado.id_socio, socioToSave);
    } else {
      // Creando un nuevo socio
      dialogMessage = `¿Estás seguro de que quieres crear el socio "${this.nuevoSocio.nombres} ${this.nuevoSocio.apellido}"?`;
      successMessage = 'Socio creado correctamente.';
      errorMessage = 'Error al crear socio.';

      // ¡Importante!: Eliminar id_socio cuando se está creando un nuevo socio
      // Dejar que la base de datos asigne el ID automáticamente.
      delete socioToSave.id_socio; // Asegúrate de que sea opcional en la interfaz o construye un nuevo objeto.

      operation = this.sociosService.createSocio(socioToSave);
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Acción',
        message: dialogMessage,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Si el usuario confirma
        operation.subscribe({
          next: () => {
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: successMessage,
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
            this.getSociosData(); // Refrescar la tabla
            this.cerrarFormulario();
          },
          error: (err: HttpErrorResponse) => {
            console.error(errorMessage, err);
            let userMessage = `${errorMessage} Por favor, intenta de nuevo.`;

            // Verificación específica para el error de duplicidad de 'correo' (unique key: socios_correo_key)
            if (err.status === 500 && err.error && err.error.message) {
              if (err.error.message.includes('llave duplicada') && err.error.message.includes('«socios_correo_key»')) {
                userMessage = 'Error al crear/actualizar socio: El "Correo" que intentas usar ya existe. Por favor, ingresa un correo diferente y único.';
              }
              // Manejo de otras posibles llaves duplicadas (ej. id_socio si por alguna razón se enviara)
              else if (err.error.message.includes('llave duplicada')) {
                userMessage = 'Error: Hay un conflicto de datos (por ejemplo, un campo único ya existe). Por favor, verifica los datos e intenta de nuevo.';
              }
              // Mensaje de error general del backend
              else {
                userMessage = `${errorMessage} Detalle: ${err.error.message}`;
              }
            } else {
              userMessage = `${errorMessage} Detalle: ${err.message}`;
            }

            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: userMessage,
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
          }
        });
      }
    });
  }

  eliminarSocio(id: number, nombres: string, apellido: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar al socio "${nombres} ${apellido}"? Esta acción es irreversible.`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        isDanger: true // Para aplicar estilos de botón de peligro
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Si el usuario confirma
        this.sociosService.deleteSocio(id).subscribe({
          next: () => {
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: 'Socio eliminado correctamente.',
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
            this.getSociosData(); // Refrescar la tabla
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al eliminar socio:', err);
            let userMessage = 'Error al eliminar socio. Por favor, intenta de nuevo.';
            if (err.error && err.error.message) {
              userMessage = `Error al eliminar socio: ${err.error.message}`;
            }
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: userMessage,
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
          }
        });
      }
    });
  }
   irAPagina(titulo: string): void {
    this.router.navigate([titulo])

  }
}