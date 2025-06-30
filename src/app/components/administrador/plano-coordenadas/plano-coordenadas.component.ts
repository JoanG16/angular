import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { FormsModule } from '@angular/forms';
import { ContenedorService } from '../../../services/page/contenedor.service';
import { CommonModule } from '@angular/common';
import { SociosService } from '../../../services/administrador/socios.service';
import { Socio } from '../../../interfaces/socio.interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-plano-coordenadas',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ConfirmDialogComponent
  ],
  templateUrl: './plano-coordenadas.component.html',
  styleUrls: ['./plano-coordenadas.component.css'],
})
export class PlanoCoordenadasComponent implements AfterViewInit, OnInit, OnDestroy {
  private map!: L.Map;
  private drawnItems!: L.FeatureGroup;
  public coordenadasTexto: string = '';
  public numeroContenedor: string = '';
  public bloque: string = '';
  public coordenadasArray: number[][] = [];
  public contenedores: any[] = [];
  // Array para almacenar los socios cargados
  public socios: Socio[] = [];
  // ID del socio seleccionado en el formulario
  public socioSeleccionado: number | null = null;
  // Contenedor seleccionado en la tabla para edición/eliminación
  public contenedorSeleccionado: any = null;
  public isEditing: boolean = false;

  readonly imageWidth = 1137;
  readonly imageHeight = 640;

  constructor(
    private contenedorService: ContenedorService,
    private sociosService: SociosService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {

    this.cargarSocios();

    this.cargarContenedores();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const bounds: L.LatLngBoundsExpression = [
      [0, 0],
      [this.imageHeight, this.imageWidth],
    ];

    this.map = L.map('map', {
      crs: L.CRS.Simple,
      zoomControl: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
    });

    L.imageOverlay('assets/nuevomercado.png', bounds).addTo(this.map);
    this.map.fitBounds(bounds);

    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: 'turquoise',
            fillOpacity: 0.4,
          },
        },
      },
      edit: {
        featureGroup: this.drawnItems,
      },
    });

    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      this.drawnItems.addLayer(layer);
      this.actualizarCoordenadas(layer);
    });

    this.map.on(L.Draw.Event.EDITED, (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        this.actualizarCoordenadas(layer);
      });
    });

    this.map.on(L.Draw.Event.DELETED, (e: any) => {
      this.coordenadasTexto = '';
      this.coordenadasArray = [];
    });
  }

  private actualizarCoordenadas(layer: L.Layer): void {
    try {
      if ('getLatLngs' in layer) {
        const latlngs = (layer as L.Polygon).getLatLngs();
        if (Array.isArray(latlngs) && latlngs.length > 0) {
          const coords = (latlngs[0] as L.LatLng[]).map((p: L.LatLng) => [Math.round(p.lng), Math.round(p.lat)]);

          if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
            coords.push(coords[0]);
          }

          this.coordenadasArray = coords;
          this.coordenadasTexto = `Coordenadas: [\n  ${coords.map((p: number[]) => `[${p[0]}, ${p[1]}]`).join(',\n  ')}\n]`;
        }
      }
    } catch (e) {
      console.error("Error en actualizarCoordenadas (Leaflet Draw issue):", e);
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Error de Dibujo en Mapa',
          message: 'Hubo un error al procesar las coordenadas del dibujo. Por favor, intenta de nuevo o contacta soporte si persiste.',
          confirmButtonText: 'Cerrar',
          isDanger: true,
          hideCancelButton: true
        }
      });
    }
  }

  public guardarOActualizarContenedor() {
    if (!this.numeroContenedor || !this.bloque || this.coordenadasArray.length === 0 || this.socioSeleccionado === null) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Campos Incompletos',
          message: 'Por favor, completa todos los campos, dibuja el contenedor y selecciona un socio.',
          confirmButtonText: 'Entendido',
          hideCancelButton: true
        }
      });
      return;
    }

    const payload = {
      numero_contenedor: this.numeroContenedor,
      bloque: this.bloque,
      geom: this.coordenadasArray, // Se envía como array de [lng, lat]
      socioId: this.socioSeleccionado,
    };

    if (this.isEditing && this.contenedorSeleccionado) {
      // Lógica para actualizar un contenedor existente
      this.contenedorService.updateContenedor(this.contenedorSeleccionado.id_contenedor, payload).subscribe({
        next: () => {
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Éxito',
              message: 'Contenedor actualizado correctamente.',
              confirmButtonText: 'Aceptar',
              hideCancelButton: true
            }
          });
          this.resetForm();
          this.cargarContenedores();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Error al Actualizar',
              message: 'Hubo un error al actualizar el contenedor: ' + (err.error?.message || 'Error desconocido.'),
              confirmButtonText: 'Cerrar',
              isDanger: true,
              hideCancelButton: true
            }
          });
        }
      });
    } else {
      // Lógica para crear un nuevo contenedor
      this.contenedorService.createContenedor(payload).subscribe({
        next: () => {
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Éxito',
              message: 'Contenedor guardado correctamente.',
              confirmButtonText: 'Aceptar',
              hideCancelButton: true
            }
          });
          this.resetForm(); // Reset form and mode
          this.cargarContenedores(); // Refresh list and map
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Error al Guardar',
              message: 'Hubo un error al guardar el contenedor: ' + (err.error?.message || 'Error desconocido.'),
              confirmButtonText: 'Cerrar',
              isDanger: true,
              hideCancelButton: true
            }
          });
        },
      });
    }
  }

  cargarContenedores(): void {
    this.contenedorService.getContenedores().subscribe(
      (data) => {
        this.contenedores = data;
        this.displayContenedoresOnMap();
      },
      (error) => {
        console.error('Error fetching contenedores:', error);
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error de Carga',
            message: 'No se pudieron cargar los contenedores desde el servidor.',
            confirmButtonText: 'Cerrar',
            isDanger: true,
            hideCancelButton: true
          }
        });
      }
    );
  }

  cargarSocios(): void {
    this.sociosService.getAllSocios().subscribe({
      next: (socios) => {
        console.log('Socios cargados en Frontend:', socios);
        this.socios = socios;
      },
      error: (err) => {
        console.error('Error al cargar socios en Frontend:', err);
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error de Carga',
            message: 'No se pudo cargar la lista de socios.',
            confirmButtonText: 'Cerrar',
            isDanger: true,
            hideCancelButton: true
          }
        });
      }
    });
  }

  displayContenedoresOnMap(): void {

    this.map.eachLayer((layer) => {

      if (layer instanceof L.Polygon) {
        this.map.removeLayer(layer);
      }
    });
    this.drawnItems.clearLayers();

    this.contenedores.forEach(contenedor => {

      if (contenedor.geom && contenedor.geom.coordinates && contenedor.geom.coordinates[0]) {
        const coords = contenedor.geom.coordinates[0];
        const latlngs = coords.map(([lng, lat]: [number, number]) => L.latLng(lat, lng));

        const polygon = L.polygon(latlngs, {
          color: 'blue',
          fillColor: 'lightblue',
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.3
        });
        polygon.addTo(this.map);

        const socioNombre = this.getSocioNombre(contenedor.socioId);
        polygon.bindPopup(`
          <strong>No. Contenedor:</strong> ${contenedor.numero_contenedor}<br>
          <strong>Bloque:</strong> ${contenedor.bloque}<br>
          <strong>Socio:</strong> ${socioNombre}
        `);

        polygon.on('click', () => {
          this.selectContenedor(contenedor);
        });
      } else {
        console.warn('Contenedor sin geom válido o con formato inesperado:', contenedor);
      }
    });
  }

  getSocioNombre(socioId: number | undefined): string {
    if (socioId === undefined || socioId === null) {
      return 'N/A';
    }
    const socio = this.socios.find(s => s.id_socio === socioId);
    return socio ? socio.nombres : 'Socio Desconocido';
  }

  selectContenedor(contenedor: any): void {
    this.contenedorSeleccionado = contenedor;
    this.isEditing = true;
    this.numeroContenedor = contenedor.numero_contenedor;
    this.bloque = contenedor.bloque;
    this.socioSeleccionado = contenedor.socioId || null;
    this.drawnItems.clearLayers();
    if (contenedor.geom && contenedor.geom.coordinates && contenedor.geom.coordinates[0]) {
      const coords = contenedor.geom.coordinates[0];
      const latlngs = coords.map(([lng, lat]: [number, number]) => L.latLng(lat, lng));
      const polygon = L.polygon(latlngs, {
        color: 'red',
        fillColor: 'pink',
        weight: 3,
        opacity: 0.9,
        fillOpacity: 0.5
      });
      polygon.addTo(this.drawnItems);
      this.map.fitBounds(polygon.getBounds());
      this.coordenadasArray = coords.map((p: number[]) => [Math.round(p[0]), Math.round(p[1])]);
      this.coordenadasTexto = `Coordenadas: [\n  ${this.coordenadasArray.map((p: number[]) => `[${p[0]}, ${p[1]}]`).join(',\n  ')}\n]`;
    }
  }

  deleteContenedor(): void {
    if (!this.contenedorSeleccionado) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Error de Eliminación',
          message: 'Por favor, selecciona un contenedor para eliminar.',
          confirmButtonText: 'Cerrar',
          isDanger: true,
          hideCancelButton: true
        }
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar el contenedor "${this.contenedorSeleccionado.numero_contenedor}" (Bloque: ${this.contenedorSeleccionado.bloque})? Esta acción no se puede deshacer.`,
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contenedorService.deleteContenedor(this.contenedorSeleccionado.id_contenedor).subscribe({
          next: () => {
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: 'Contenedor eliminado correctamente.',
                confirmButtonText: 'Aceptar',
                hideCancelButton: true
              }
            });
            this.cargarContenedores();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error al Eliminar',
                message: 'Hubo un error al eliminar el contenedor: ' + (err.error?.message || 'Error desconocido.'),
                confirmButtonText: 'Cerrar',
                isDanger: true,
                hideCancelButton: true
              }
            });
          },
        });
      }
    });
  }

  resetForm(): void {
    this.numeroContenedor = '';
    this.bloque = '';
    this.coordenadasTexto = '';
    this.coordenadasArray = [];
    this.socioSeleccionado = null;
    this.contenedorSeleccionado = null;
    this.isEditing = false;
    this.drawnItems.clearLayers();
    this.displayContenedoresOnMap();
  }
}