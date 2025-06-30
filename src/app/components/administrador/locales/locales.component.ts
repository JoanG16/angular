import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


import { LocalesService } from '../../../services/administrador/locales.service';
import { ContenedoresService } from '../../../services/administrador/contenedores.service';
import { Local } from '../../../interfaces/locales.interface';
import { Contenedor } from '../../../interfaces/contenedor.interface';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { Observable, forkJoin } from 'rxjs';

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
  allLocales: Local[] = [];      // Almacena todos los locales sin filtrar
  locales: Local[] = [];         // Almacena los locales actualmente mostrados (filtrados)
  todosLosContenedores: Contenedor[] = [];
  contenedoresFiltrados: Contenedor[] = [];
  bloquesUnicos: string[] = [];

  // Propiedades para la funcionalidad del formulario (crear/editar)
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
    id_contenedor: 0,
   creado_en: new Date().toISOString(), // Convierte la fecha a una cadena en formato ISO 8601
    selectedBloque: null,
    imagen_urls: [], // Ahora es un array para múltiples imágenes
    descripcion: '' // NUEVO CAMPO: Descripción del local
  };

  // Referencia a los archivos de imagen seleccionados
  public selectedFiles: File[] = [];

  // **CAMBIO CLAVE**: URL base de tu backend para cargar imágenes
  public backendBaseUrl: string = 'http://localhost:3000';


  // NUEVAS PROPIEDADES PARA LOS FILTROS DE BÚSQUEDA
  filterBloque: string | null = null; // Para el filtro por bloque (valor del select)
  filterNombreLocal: string = '';     // Para el input de búsqueda por nombre

  constructor(
    private localesService: LocalesService,
    private contenedoresService: ContenedoresService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Usamos forkJoin para asegurarnos de que ambos datos estén disponibles antes de procesar
    forkJoin({
      locales: this.localesService.getAllLocales(), // Usar getAllLocales
      contenedores: this.contenedoresService.getAllContenedores()
    }).subscribe({
      next: ({ locales, contenedores }) => {
        this.allLocales = locales;
        this.todosLosContenedores = contenedores.data;
        this.extractUniqueBloques(); // Extrae los bloques únicos una vez cargados los contenedores
        this.applyFilters(); // Aplica los filtros iniciales (todos los locales)
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar datos iniciales:', err);
        // Puedes mostrar un mensaje de error al usuario
      }
    });
  }

  getLocalesData(): void {
    this.localesService.getAllLocales().subscribe({ // Usar getAllLocales
      next: (data: Local[]) => {
        this.allLocales = data;
        this.applyFilters();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al obtener locales:', err);
        // ... (manejo de errores) ...
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
    this.nuevoLocal.id_contenedor = 0; // Resetear el contenedor al cambiar el bloque
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
      id_contenedor: 0,
      creado_en: new Date().toISOString(), // Convierte la fecha a una cadena en formato ISO 8601
      selectedBloque: null,
      imagen_urls: [],
      descripcion: '' // Reiniciar el nuevo campo
    };
    this.selectedFiles = [];
    this.filterContenedoresByBloque();
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(local: Local): void {
    this.localSeleccionado = { ...local };
    // Asegurarse de copiar todos los campos existentes, incluyendo el nuevo
    this.nuevoLocal = {
      ...local,
      imagen_urls: local.imagen_urls ? [...local.imagen_urls] : [],
      descripcion: local.descripcion || '' // Asegurar que sea string vacío si es null/undefined
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
      id_contenedor: 0,
      creado_en: new Date().toISOString(), // Convierte la fecha a una cadena en formato ISO 8601
      selectedBloque: null,
      imagen_urls: [],
      descripcion: '' // Reiniciar el nuevo campo
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

    if (fileList && fileList.length > 0) {
      this.nuevoLocal.imagen_urls = [];
      this.selectedFiles = [];

      Array.from(fileList).forEach(file => {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.nuevoLocal.imagen_urls!.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    } else {
      this.selectedFiles = [];
      this.nuevoLocal.imagen_urls = [];
    }
  }

  removeImage(index: number): void {
    if (this.nuevoLocal.imagen_urls && index > -1 && index < this.nuevoLocal.imagen_urls.length) {
      this.nuevoLocal.imagen_urls.splice(index, 1);
      this.selectedFiles.splice(index, 1);
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

    // Asegurarse de que el campo descripcion se incluya en el payload
    localPayload.descripcion = this.nuevoLocal.descripcion || undefined; // Usa undefined para propiedades opcionales
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
              }
              else if (err.error.message.includes('llave duplicada')) {
                userMessage = 'Error: Hay un conflicto de datos (por ejemplo, un ID o un campo único ya existe). Por favor, verifica los datos e intenta de nuevo.';
              }
              else if (err.error.message) {
                userMessage = `${errorMessage} Detalle: ${err.error.message}`;
              }
            }
            else {
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
}
