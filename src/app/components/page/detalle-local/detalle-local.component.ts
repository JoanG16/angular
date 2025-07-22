// src/app/components/page/detalle-local/detalle-local.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { LocalesService } from '../../../services/administrador/locales.service'; // Asegúrate de que esta ruta sea correcta
import { ContenedoresService } from '../../../services/administrador/contenedores.service'; // <-- Importa ContenedoresService
import { Local } from '../../../interfaces/locales.interface';
import { Contenedor, ContenedorResponse } from '../../../interfaces/contenedor.interface'; // <-- Importa Contenedor y ContenedorResponse
import { Producto } from '../../../interfaces/producto.interface';
import { Categoria } from '../../../interfaces/categoria.interface';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs'; // Necesario para combinar observables

// Extender la interfaz Local para incluir el nombre del bloque para la vista de detalle
interface LocalDetalle extends Local {
  nombre_bloque?: string; // Propiedad para el nombre del bloque
}

@Component({
  selector: 'app-detalle-local',
  standalone: true,
  imports: [CommonModule, DatePipe, HttpClientModule, RouterLink],
  templateUrl: './detalle-local.component.html',
  styleUrls: ['./detalle-local.component.css']
})
export class DetalleLocalComponent implements OnInit, OnDestroy {
  local: LocalDetalle | null = null; // Usar la interfaz extendida
  currentImageIndex: number = 0;
  currentYear: number = new Date().getFullYear();
  isLoading: boolean = true;

  private routeSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localesService: LocalesService,
    private contenedoresService: ContenedoresService // <-- Inyecta ContenedoresService
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isLoading = true;
        this.loadLocalAndContenedorDetails(parseInt(id, 10)); // <-- Llama a la nueva función
      } else {
        console.error('No se proporcionó un ID de local en los parámetros de la ruta.');
        this.router.navigate(['/locales']); // Redirigir a la lista de locales
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadLocalAndContenedorDetails(localId: number): void {
    forkJoin({
      localResponse: this.localesService.getOneLocal(localId), // Este ya devuelve Local
      contenedoresResponse: this.contenedoresService.getAllContenedores() // Este devuelve ContenedorResponse
    }).subscribe({
      next: ({ localResponse, contenedoresResponse }: { localResponse: Local, contenedoresResponse: ContenedorResponse }) => {
        // Asignar el local
        const localData: Local = localResponse; // localResponse ya es de tipo Local

        // Encontrar el contenedor asociado
        const contenedor = contenedoresResponse.data.find(c => c.id_contenedor === localData.id_contenedor);

        // Crear el objeto local extendido
        this.local = {
          ...localData,
          nombre_bloque: contenedor ? contenedor.bloque : 'N/A'
        };

        console.log('Detalles del local cargados:', this.local);
        if (this.local.imagen_urls && this.local.imagen_urls.length > 0) {
          this.currentImageIndex = 0;
        }
        this.isLoading = false;
      },
      error: (err: any) => { // Tipado de 'err'
        console.error('Error al cargar los detalles del local o contenedores:', err);
        this.local = null;
        this.isLoading = false;
        this.router.navigate(['/locales']); // Redirigir a la lista de locales
      }
    });
  }

  prevImage(): void {
    if (this.local && this.local.imagen_urls && this.local.imagen_urls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.local.imagen_urls.length) % this.local.imagen_urls.length;
    }
  }

  nextImage(): void {
    if (this.local && this.local.imagen_urls && this.local.imagen_urls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.local.imagen_urls.length;
    }
  }

  goToImage(index: number): void {
    if (this.local && this.local.imagen_urls && index >= 0 && index < this.local.imagen_urls.length) {
      this.currentImageIndex = index;
    }
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://placehold.co/600x400/ADD8E6/000000?text=Imagen+No+Disponible';
    console.warn('Error al cargar la imagen:', imgElement.src);
  }

  goBack(): void {
    this.router.navigate(['/local']);
  }
}
