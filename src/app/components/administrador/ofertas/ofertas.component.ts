// src/app/components/administrador/ofertas/ofertas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { OfertaService } from '../../../services/administrador/ofertas.service';
import { Oferta } from '../../../interfaces/oferta.interface';
import { Router } from '@angular/router';
@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogComponent
  ],
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css']
})
export class OfertasComponent implements OnInit {
  ofertas: Oferta[] = [];

  // Propiedades para el formulario
  ofertaSeleccionada: Oferta | null = null;
  tipoContenido: 'promocion' | 'tiktok' | 'youtube' = 'promocion';
  valorContenido: string = '';
  orden: number | null = null; // Tipo corregido: solo number o null, no undefined
  activo: boolean = true;
  isEditing: boolean = false;

  tiposContenido = [
    { value: 'promocion', viewValue: 'Promoción de Texto' },
    { value: 'tiktok', viewValue: 'Enlace de TikTok' },
    { value: 'youtube', viewValue: 'Enlace de YouTube' }
  ];

  constructor(
    private ofertaService: OfertaService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarOfertas();
  }

  cargarOfertas(): void {
    this.ofertaService.getAllOfertas().subscribe({
      next: (data) => {
        this.ofertas = data;
        console.log('Ofertas cargadas:', this.ofertas);
      },
      error: (err) => {
        console.error('Error al cargar ofertas:', err);
        this.mostrarMensajeError('Error de Carga', 'No se pudieron cargar las ofertas desde el servidor.');
      }
    });
  }

  // NUEVO MÉTODO: Obtiene el 'viewValue' del tipo de contenido para mostrar en la tabla
  getTipoContenidoViewValue(tipo: 'promocion' | 'tiktok' | 'youtube'): string {
    const foundType = this.tiposContenido.find(t => t.value === tipo);
    return foundType ? foundType.viewValue : tipo; // Devuelve el viewValue o el tipo original si no se encuentra
  }

  guardarOActualizarOferta(): void {
    if (!this.valorContenido) {
      this.mostrarMensajeError('Campos Incompletos', 'El valor del contenido es obligatorio.');
      return;
    }

    const payload = {
      tipo_contenido: this.tipoContenido,
      valor_contenido: this.valorContenido,
      orden: this.orden, // Envía null si es null
      activo: this.activo
    };

    if (this.isEditing && this.ofertaSeleccionada) {
      this.ofertaService.updateOferta(this.ofertaSeleccionada.id_oferta, payload).subscribe({
        next: () => {
          this.mostrarMensajeExito('Oferta actualizada correctamente.');
          this.resetForm();
          this.cargarOfertas();
        },
        error: (err) => {
          console.error('Error al actualizar oferta:', err);
          this.mostrarMensajeError('Error al Actualizar', 'Hubo un error al actualizar la oferta: ' + (err.error?.message || 'Error desconocido.'));
        }
      });
    } else {
      this.ofertaService.createOferta(payload).subscribe({
        next: () => {
          this.mostrarMensajeExito('Oferta creada correctamente.');
          this.resetForm();
          this.cargarOfertas();
        },
        error: (err) => {
          console.error('Error al crear oferta:', err);
          this.mostrarMensajeError('Error al Crear', 'Hubo un error al crear la oferta: ' + (err.error?.message || 'Error desconocido.'));
        }
      });
    }
  }

  seleccionarOfertaParaEditar(oferta: Oferta): void {
    this.ofertaSeleccionada = oferta;
    this.isEditing = true;
    this.tipoContenido = oferta.tipo_contenido;
    this.valorContenido = oferta.valor_contenido;
    // CORRECCIÓN: Asegurarse de que el valor sea number o null.
    // 'oferta.orden' debería ser 'number | null' desde la interfaz.
    // Si por alguna razón es 'undefined' desde el backend, lo convertimos a 'null'.
    this.orden = oferta.orden !== undefined ? oferta.orden : null;
    this.activo = oferta.activo;
  }

  eliminarOferta(oferta: Oferta): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar la oferta de tipo "${this.getTipoContenidoViewValue(oferta.tipo_contenido)}" con contenido "${oferta.valor_contenido.substring(0, 50)}..."? Esta acción no se puede deshacer.`,
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar',
        isDanger: true
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.ofertaService.deleteOferta(oferta.id_oferta).subscribe({
          next: () => {
            this.mostrarMensajeExito('Oferta eliminada correctamente.');
            this.cargarOfertas();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error al eliminar oferta:', err);
            this.mostrarMensajeError('Error al Eliminar', 'Hubo un error al eliminar la oferta: ' + (err.error?.message || 'Error desconocido.'));
          }
        });
      }
    });
  }

  resetForm(): void {
    this.ofertaSeleccionada = null;
    this.tipoContenido = 'promocion';
    this.valorContenido = '';
    this.orden = null; // Reiniciar a null
    this.activo = true;
    this.isEditing = false;
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
