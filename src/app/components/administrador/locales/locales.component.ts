import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { LocalesService } from '../../../services/administrador/locales.service';
import { ContenedoresService } from '../../../services/administrador/contenedores.service';
import { Local, LocalResponse } from '../../../interfaces/locales.interface';
import { Contenedor } from '../../../interfaces/contenedor.interface';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './locales.component.html',
  styleUrl: './locales.component.css'
})
export class LocalesComponent implements OnInit {
  allLocales: Local[] = [];
  locales: Local[] = [];
  todosLosContenedores: Contenedor[] = [];
  contenedoresFiltrados: Contenedor[] = [];
  bloquesUnicos: string[] = [];

  mostrarFormulario: boolean = false;
  localSeleccionado: Local | null = null;

  nuevoLocal: Local & { selectedBloque?: string | null } = {
    id_local: 0,
    nombre_del_negocio: '',
    nombre_del_dueno: '',
    codigo_local: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    telefono: '',
    ruc: '',
    correo: '',
    activo: false,
    id_contenedor: 0,
    creado_en: new Date().toISOString(),
    selectedBloque: null,
    imagen_urls: [],
    descripcion: ''
  };

  public selectedFiles: File[] = [];
  public backendBaseUrl: string = environment.apiUrl;
  filterBloque: string | null = null;
  filterNombreLocal: string = '';

  constructor(
    private localesService: LocalesService,
    private contenedoresService: ContenedoresService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
    forkJoin({
      locales: this.localesService.getAllLocales(),
      contenedores: this.contenedoresService.getAllContenedores()
    }).subscribe({
      next: ({ locales, contenedores }) => {
        this.allLocales = locales;
        this.todosLosContenedores = contenedores.data;
        this.extractUniqueBloques();
        this.applyFilters();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar datos iniciales:', err);
      }
    });
  }

getLocalesData(): void {
  // Llama a la función getLocales() para obtener el Observable
  this.localesService.getLocales().subscribe({
    // El 'data' que recibes es de tipo LocalResponse.
    next: (response: LocalResponse) => {
      // Accedes a la propiedad 'data' para obtener el array de locales.
      this.allLocales = response.data;
      this.applyFilters();
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error al obtener locales:', err);
    }
  });
}

  getContenedoresData(): void {
    this.contenedoresService.getAllContenedores().subscribe({
      next: (response: { data: Contenedor[] }) => {
        this.todosLosContenedores = response.data;
        this.extractUniqueBloques();
        this.filterContenedoresByBloque();
        console.log('Contenedores cargados:', this.todosLosContenedores);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al obtener contenedores:', err);
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error',
            message: 'Error al cargar los contenedores disponibles. Detalle: ' + err.message,
            confirmButtonText: 'Aceptar',
            hideCancelButton: true
          }
        });
      }
    });
  }

  extractUniqueBloques(): void {
    const bloquesSet = new Set<string>();
    this.todosLosContenedores.forEach(c => {
      if (c.bloque) {
        bloquesSet.add(c.bloque);
      }
    });
    this.bloquesUnicos = Array.from(bloquesSet).sort();
  }

  onBloqueSelected(): void {
    this.filterContenedoresByBloque();
    this.nuevoLocal.id_contenedor = 0;
  }

  filterContenedoresByBloque(): void {
    if (this.nuevoLocal.selectedBloque) {
      this.contenedoresFiltrados = this.todosLosContenedores.filter(c => c.bloque === this.nuevoLocal.selectedBloque);
    } else {
      this.contenedoresFiltrados = [];
    }
  }

  abrirFormularioCrear(): void {
    this.localSeleccionado = null;
    this.nuevoLocal = {
      id_local: 0,
      nombre_del_negocio: '',
      nombre_del_dueno: '',
      codigo_local: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      telefono: '',
      ruc: '',
      correo: '',
      activo: true,
      id_contenedor: 0,
      creado_en: new Date().toISOString(),
      selectedBloque: null,
      imagen_urls: [],
      descripcion: ''
    };
    this.selectedFiles = [];
    this.filterContenedoresByBloque();
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(local: Local): void {
    this.localSeleccionado = { ...local };
    this.nuevoLocal = {
      ...local,
      imagen_urls: local.imagen_urls ? [...local.imagen_urls] : [],
      descripcion: local.descripcion || ''
    };

    this.selectedFiles = [];

    const contenedorAsociado = this.todosLosContenedores.find(c => c.id_contenedor === local.id_contenedor);
    if (contenedorAsociado && contenedorAsociado.bloque) {
      this.nuevoLocal.selectedBloque = contenedorAsociado.bloque;
      this.filterContenedoresByBloque();
    } else {
      this.nuevoLocal.selectedBloque = null;
      this.filterContenedoresByBloque();
    }

    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.localSeleccionado = null;
    this.selectedFiles = [];
    this.nuevoLocal = {
      id_local: 0,
      nombre_del_negocio: '',
      nombre_del_dueno: '',
      codigo_local: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      telefono: '',
      ruc: '',
      correo: '',
      activo: false,
      id_contenedor: 0,
      creado_en: new Date().toISOString(),
      selectedBloque: null,
      imagen_urls: [],
      descripcion: ''
    };
    this.filterContenedoresByBloque();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (!this.nuevoLocal.imagen_urls) {
      this.nuevoLocal.imagen_urls = [];
    }
    if (!this.selectedFiles) {
      this.selectedFiles = [];
    }

    const existingImageUrls = this.localSeleccionado ? [...this.localSeleccionado.imagen_urls || []] : [];
    this.nuevoLocal.imagen_urls = [...existingImageUrls];
    this.selectedFiles = [];

    if (fileList && fileList.length > 0) {
      Array.from(fileList).forEach(file => {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.nuevoLocal.imagen_urls!.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    if (this.nuevoLocal.imagen_urls && index > -1 && index < this.nuevoLocal.imagen_urls.length) {
      this.nuevoLocal.imagen_urls.splice(index, 1);
    }
  }

  guardarLocal(): void {
    if (!this.nuevoLocal.nombre_del_negocio || !this.nuevoLocal.nombre_del_dueno || !this.nuevoLocal.codigo_local || !this.nuevoLocal.id_contenedor) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Campos Requeridos',
          message: 'Por favor, completa todos los campos obligatorios: Nombre del Negocio, Nombre del Dueño, Código Local y N° Contenedor.',
          confirmButtonText: 'Aceptar',
          hideCancelButton: true
        }
      });
      return;
    }

    let dialogMessage: string;
    let successMessage: string;
    let errorMessage: string;
    let operation: Observable<Local>;

    const { selectedBloque, ...baseLocalData } = this.nuevoLocal;

    const localPayload: Partial<Local> = { ...baseLocalData };

    localPayload.descripcion = this.nuevoLocal.descripcion || undefined;

    localPayload.imagen_urls = this.nuevoLocal.imagen_urls;


    if (this.localSeleccionado && this.localSeleccionado.id_local) {
      dialogMessage = `¿Estás seguro de que quieres guardar los cambios para el local "${this.nuevoLocal.nombre_del_negocio}"?`;
      successMessage = 'Local actualizado correctamente.';
      errorMessage = 'Error al actualizar local.';
      operation = this.localesService.updateLocal(this.localSeleccionado.id_local, localPayload as Local);
    } else {
      dialogMessage = `¿Estás seguro de que quieres crear el local "${this.nuevoLocal.nombre_del_negocio}"?`;
      successMessage = 'Local creado correctamente.';
      errorMessage = 'Error al crear local.';

      if (localPayload.id_local === 0) {
        delete localPayload.id_local;
      }
      operation = this.localesService.createLocal(localPayload as Local);
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
      if (result) {
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
            this.getLocalesData();
            this.cerrarFormulario();
          },
          error: (err: HttpErrorResponse) => {
            console.error(errorMessage, err);
            let userMessage = `${errorMessage} Por favor, intenta de nuevo.`;

            if (err.status === 500 && err.error && err.error.message) {
              if (err.error.message.includes('llave duplicada') && err.error.message.includes('«locales_codigo_local_key»')) {
                userMessage = 'Error al crear local: El "Código de Local" que intentas usar ya existe. Por favor, ingresa un código diferente y único.';
              } else if (err.error.message.includes('llave duplicada')) {
                userMessage = 'Error: Hay un conflicto de datos (por ejemplo, un ID o un campo único ya existe). Por favor, verifica los datos e intenta de nuevo.';
              } else if (err.error.message) {
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

  applyFilters(): void {
    console.log('applyFilters: Valor de this.allLocales antes de la operación:', this.allLocales);
    let filtered = [...this.allLocales];

    if (this.filterBloque && this.filterBloque !== 'Todos') {
      filtered = filtered.filter(local => {
        const contenedor = this.todosLosContenedores.find(c => c.id_contenedor === local.id_contenedor);
        return contenedor && contenedor.bloque === this.filterBloque;
      });
    }

    if (this.filterNombreLocal) {
      const searchTerm = this.filterNombreLocal.toLowerCase().trim();
      filtered = filtered.filter(local =>
        local.nombre_del_negocio.toLowerCase().includes(searchTerm)
      );
    }

    // Aquí se corrige el problema de duplicación de locales y el filtro de activo
    this.locales = filtered;
  }

  // MODIFICADO: Ahora el botón de "eliminar" desactiva el local
  eliminarLocal(id: number, nombre: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Desactivación',
        message: `¿Estás seguro de que quieres desactivar el local "${nombre}"?`,
        confirmButtonText: 'Desactivar',
        cancelButtonText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.localesService.deleteLocal(id).subscribe({
          next: () => {
            // Se actualiza el estado en el array local primero para una respuesta visual instantánea
            const localToUpdate = this.allLocales.find(l => l.id_local === id);
            if (localToUpdate) {
              localToUpdate.activo = false;
              this.applyFilters();
            }

            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: 'Local desactivado correctamente.',
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
            // Y luego se refresca el array completo para asegurar la consistencia
            this.getLocalesData();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al desactivar local:', err);
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: 'Error al desactivar local. Por favor, intenta de nuevo. Detalle: ' + err.message,
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
          }
        });
      }
    });
  }

  // MODIFICADO: Método para activar un local
  activarLocal(id: number, nombre: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Activación',
        message: `¿Estás seguro de que quieres activar el local "${nombre}"?`,
        confirmButtonText: 'Activar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.localesService.activateLocal(id).subscribe({
          next: () => {
            // Se actualiza el estado en el array local primero para una respuesta visual instantánea
            const localToUpdate = this.allLocales.find(l => l.id_local === id);
            if (localToUpdate) {
              localToUpdate.activo = true;
              this.applyFilters();
            }

            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: 'Local activado correctamente.',
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
            // Y luego se refresca el array completo para asegurar la consistencia
            this.getLocalesData();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al activar local:', err);
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: 'Error al activar local. Por favor, intenta de nuevo. Detalle: ' + err.message,
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
          }
        });
      }
    });
  }

  downloadExcelReport(): void {
    this.localesService.downloadLocalesExcel().subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'locales-reporte.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al descargar el reporte de Excel:', err);
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error en la Descarga',
            message: 'Ocurrió un error al intentar descargar el archivo. Por favor, inténtalo de nuevo.',
            confirmButtonText: 'Aceptar',
            hideCancelButton: true
          }
        });
      }
    });
  }

  getImageUrl(url: string): string {
    return url;
  }

  irAPagina(titulo: string): void {
    this.router.navigate([titulo])
  }
}