// src/app/components/administrador/locales/locales.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { LocalesService } from '../../../services/administrador/locales.service';
import { ContenedoresService } from '../../../services/administrador/contenedores.service';
import { Local, contenedor } from '../../../interfaces/locales.interface';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Definimos una interfaz para el formato de respuesta de la API,
// basándonos en el console.log que el usuario mostró.
interface ApiResponse<T> {
  statusCode: number;
  status: string;
  message: string;
  data: T;
}

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
  // Ahora el tipo de allLocales es una lista de objetos Local
  allLocales: Local[] = [];
  locales: Local[] = [];
  todosLosContenedores: contenedor[] = [];
  contenedoresFiltrados: contenedor[] = [];
  bloquesUnicos: string[] = [];

  mostrarFormulario: boolean = false;
  localSeleccionado: Local | null = null;

  nuevoLocal: Local & { selectedBloque?: string | null } = {
    id_local: 0,
    nombre_del_negocio: '',
    nombre_del_dueno: '',
    codigo_local: '',
    ruc: '',
    correo: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    telefono: '',
    id_contenedor: 0,
    creado_en: new Date().toISOString(),
    selectedBloque: null,
    imagen_urls: [],
    descripcion: '',
    activo: true
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
    // Usamos forkJoin para cargar ambos sets de datos en paralelo
    forkJoin({
      // CORRECCIÓN: Se cambia 'getLocales' a 'getAllLocales'
      locales: this.localesService.getAllLocales(),
      contenedores: this.contenedoresService.getAllContenedores()
    }).subscribe({
      next: ({ locales, contenedores }) => {
        // Se accede a la propiedad 'data' de la respuesta
        this.allLocales = locales.data;
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
    // CORRECCIÓN: Se cambia 'getLocales' a 'getAllLocales'
    this.localesService.getAllLocales().subscribe({
      // Ahora 'response' ya es del tipo ApiResponse<Local[]> gracias al servicio corregido.
      next: (response) => {
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
      next: (response) => {
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
      ruc: '',
      correo: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      telefono: '',
      id_contenedor: 0,
      creado_en: new Date().toISOString(),
      selectedBloque: null,
      imagen_urls: [],
      descripcion: '',
      activo: true
    };
    this.selectedFiles = [];
    this.filterContenedoresByBloque();
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(local: Local): void {
    this.localSeleccionado = { ...local };
    this.nuevoLocal = {
      ...local,
      ruc: local.ruc || '',
      correo: local.correo || '',
      imagen_urls: local.imagen_urls ? [...local.imagen_urls] : [],
      descripcion: local.descripcion || '',
      activo: local.activo
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
      ruc: '',
      correo: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      telefono: '',
      id_contenedor: 0,
      creado_en: new Date().toISOString(),
      selectedBloque: null,
      imagen_urls: [],
      descripcion: '',
      activo: true
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
    if (!this.nuevoLocal.nombre_del_negocio || !this.nuevoLocal.nombre_del_dueno || !this.nuevoLocal.codigo_local || !this.nuevoLocal.id_contenedor || !this.nuevoLocal.ruc || !this.nuevoLocal.correo) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Campos Requeridos',
          message: 'Por favor, completa todos los campos obligatorios: Nombre del Negocio, Nombre del Dueño, Código Local, RUC, Correo y N° Contenedor.',
          confirmButtonText: 'Aceptar',
          hideCancelButton: true
        }
      });
      return;
    }

    let dialogMessage: string;
    let successMessage: string;
    let errorMessage: string;
    let operation: Observable<ApiResponse<Local | {}>>;

    const { selectedBloque, ...baseLocalData } = this.nuevoLocal;
    const localPayload: Partial<Local> = { ...baseLocalData };

    localPayload.descripcion = this.nuevoLocal.descripcion || undefined;
    localPayload.ruc = this.nuevoLocal.ruc || undefined;
    localPayload.correo = this.nuevoLocal.correo || undefined;
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

  downloadExcelReport(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Descarga',
        message: '¿Estás seguro de que quieres descargar el reporte de locales en formato Excel?',
        confirmButtonText: 'Sí, descargar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.localesService.downloadLocalesExcel().subscribe({
          next: (response: Blob) => {
            const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte-locales.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al descargar el reporte de Excel:', err);
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error de Descarga',
                message: 'No se pudo generar o descargar el reporte de Excel. Por favor, inténtalo de nuevo más tarde.',
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
          }
        });
      }
    });
  }

  toggleActivoStatus(local: Local): void {
    const nuevoEstado = !local.activo;
    const mensaje = nuevoEstado ? `activar` : `desactivar`;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Confirmar ${nuevoEstado ? 'Activación' : 'Desactivación'}`,
        message: `¿Estás seguro de que quieres ${mensaje} el local "${local.nombre_del_negocio}"?`,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        isDanger: !nuevoEstado
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let operation$: Observable<any>;
        if (nuevoEstado) {
          operation$ = this.localesService.activateLocal(local.id_local);
        } else {
          operation$ = this.localesService.deleteLocal(local.id_local);
        }

        operation$.subscribe({
          next: () => {
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: `Local ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`,
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
            this.getLocalesData();
          },
          error: (err: HttpErrorResponse) => {
            console.error(`Error al ${mensaje} el local:`, err);
            let userMessage = `Error al ${mensaje} el local. Por favor, intenta de nuevo.`;
            if (err.error && err.error.message) {
              userMessage = `${userMessage} Detalle: ${err.error.message}`;
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
    // Ahora que allLocales es un array, la iteración funcionará correctamente.
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

    this.locales = filtered;
  }

  eliminarLocal(id: number, nombre: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar el local "${nombre}"? Esta acción es irreversible.`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.localesService.deleteLocal(id).subscribe({
          next: () => {
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: 'Local eliminado correctamente.',
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
            this.getLocalesData();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al eliminar local:', err);
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: 'Error al eliminar local. Por favor, intenta de nuevo. Detalle: ' + err.message,
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
          }
        });
      }
    });
  }

  getImageUrl(url: string): string {
    console.log('[getImageUrl DEBUG] URL recibida:', url);
    return url;
  }

  irAPagina(titulo: string): void {
    this.router.navigate([titulo])
  }
}
