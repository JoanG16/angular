// src/app/components/page/detalle-local/detalle-local.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { LocalesService } from '../../../services/page/locales.service';
import { ContenedoresService } from '../../../services/administrador/contenedores.service';
import { Local } from '../../../interfaces/locales.interface';
import { Contenedor, ContenedorResponse } from '../../../interfaces/contenedor.interface';
import { Producto } from '../../../interfaces/producto.interface';
import { Categoria } from '../../../interfaces/categoria.interface';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// Extender la interfaz Local para incluir el nombre del bloque para la vista de detalle
interface LocalDetalle extends Local {
  nombre_bloque?: string;
}

@Component({
  selector: 'app-detalle-local',
  standalone: true,
  imports: [CommonModule, DatePipe, HttpClientModule, RouterLink],
  templateUrl: './detalle-local.component.html',
  styleUrls: ['./detalle-local.component.css']
})
export class DetalleLocalComponent implements OnInit, OnDestroy {
  local: LocalDetalle | null = null;
  currentImageIndex: number = 0;
  currentYear: number = new Date().getFullYear();
  isLoading: boolean = true;

  private routeSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localesService: LocalesService,
    private contenedoresService: ContenedoresService
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isLoading = true;
        this.loadLocalAndContenedorDetails(parseInt(id, 10));
      } else {
        console.error('No se proporcionó un ID de local en los parámetros de la ruta.');
        this.router.navigate(['/locales']);
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
      localResponse: this.localesService.getOneLocal(localId),
      contenedoresResponse: this.contenedoresService.getAllContenedores()
    }).subscribe({
      next: ({ localResponse, contenedoresResponse }: { localResponse: Local, contenedoresResponse: ContenedorResponse }) => {
        const localData: Local = localResponse;

        const contenedor = contenedoresResponse.data.find(c => c.id_contenedor === localData.id_contenedor);

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
      error: (err: any) => {
        console.error('Error al cargar los detalles del local o contenedores:', err);
        this.local = null;
        this.isLoading = false;
        this.router.navigate(['/locales']);
      }
    });
  }

  /**
   * Normaliza una URL de red social.
   * Si la entrada es un nombre de usuario (ej. "@usuario"), la convierte en una URL completa.
   * Si ya es una URL completa, la devuelve tal cual.
   * @param platform La plataforma de la red social ('facebook', 'instagram', 'tiktok').
   * @param usernameOrUrl El nombre de usuario o la URL completa.
   * @returns La URL completa y válida para el enlace.
   */
  getSocialLink(platform: string, usernameOrUrl: string | undefined | null): string {
    if (!usernameOrUrl) {
      return '#'; // Devuelve un enlace vacío o un placeholder si no hay valor
    }

    // Si ya es una URL completa, la devuelve
    if (usernameOrUrl.startsWith('http://') || usernameOrUrl.startsWith('https://')) {
      return usernameOrUrl;
    }

    // Si es un nombre de usuario (ej. @maxi.sport8), construye la URL completa
    const cleanedUsername = usernameOrUrl.startsWith('@') ? usernameOrUrl.substring(1) : usernameOrUrl;

    switch (platform.toLowerCase()) {
      case 'facebook':
        return `https://www.facebook.com/${cleanedUsername}`;
      case 'instagram':
        return `https://www.instagram.com/${cleanedUsername}`;
      case 'tiktok':
        return `https://www.tiktok.com/@${cleanedUsername}`;
      default:
        return '#'; // Plataforma no reconocida
    }
  }

  /**
   * Determina el acceso sugerido al local en función de su bloque.
   * Ahora devuelve un string con <br> para que se interprete como un salto de línea en el HTML.
   * @param bloque El nombre del bloque asociado al local.
   * @returns Una cadena de texto con la información del acceso y saltos de línea HTML.
   */
  getAccesoPorBloque(bloque: string | undefined): string {
    if (!bloque) {
      return 'Información de acceso no disponible.';
    }

    const bloqueLowerCase = bloque.toLowerCase();
    let accesos: string[] = [];

    if (['b', 'c', 'd'].includes(bloqueLowerCase)) {
      accesos.push('Acceso por la Avenida de la Cultura.');
    }
    if (['c', 'e', 'f'].includes(bloqueLowerCase)) {
      accesos.push('Acceso por la Calle C.5 y la Avenida 15.');
    }
    if (['a', 'h', 'g'].includes(bloqueLowerCase)) {
      accesos.push('Acceso ubicado entre la zona de contenedores y el área de canastas del mercado.');
    }

    // Une los mensajes con un salto de línea HTML si hay más de uno.
    if (accesos.length > 0) {
      return accesos.join('<br>');
    }

    return 'Información de acceso no disponible.';
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
