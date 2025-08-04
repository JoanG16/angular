import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { LocalesService } from '../../../services/page/locales.service';
import { ContenedoresService } from '../../../services/administrador/contenedores.service';
import { AuthService } from '../../../services/administrador/auth.service';
import { Local } from '../../../interfaces/locales.interface';
import { ContenedorResponse } from '../../../interfaces/contenedor.interface';
import { forkJoin } from 'rxjs';

interface LocalDetalle extends Local {
  nombre_bloque?: string;
}

@Component({
  selector: 'app-comerciantes',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './comerciantes.component.html',
  styleUrls: ['./comerciantes.component.css']
})
export class ComerciantesComponent implements OnInit {
  localId: number | null = null;
  localData: LocalDetalle | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  currentImageIndex: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localesService: LocalesService,
    private contenedoresService: ContenedoresService,
    // ¡Aquí está el cambio! Hacemos authService público para que la plantilla HTML pueda acceder a él.
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    // ... tu código ngOnInit permanece igual
    this.route.paramMap.subscribe(params => {
        const idString = params.get('id');
        if (idString) {
          this.localId = Number(idString);
          this.loadLocalAndContenedorDetails(this.localId);
        } else {
          const authLocalIdString = this.authService.getUserLocalId();
          if (authLocalIdString) {
            this.localId = Number(authLocalIdString);
            this.loadLocalAndContenedorDetails(this.localId);
          } else {
            this.error = 'No se encontró el ID del local para este usuario.';
          }
        }
      });
  }

  loadLocalAndContenedorDetails(localId: number): void {
    this.isLoading = true;
    forkJoin({
      localResponse: this.localesService.getOneLocal(localId),
      contenedoresResponse: this.contenedoresService.getAllContenedores()
    }).subscribe({
      next: ({ localResponse, contenedoresResponse }: { localResponse: Local, contenedoresResponse: ContenedorResponse }) => {
        const localData: Local = localResponse;
        const contenedor = contenedoresResponse.data.find(c => c.id_contenedor === localData.id_contenedor);

        this.localData = {
          ...localData,
          nombre_bloque: contenedor ? contenedor.bloque : 'N/A'
        };

        if (this.localData.imagen_urls && this.localData.imagen_urls.length > 0) {
          this.currentImageIndex = 0;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar los detalles del local o contenedores:', err);
        this.localData = null;
        this.isLoading = false;
        this.error = 'Ocurrió un error al cargar los datos del local.';
      }
    });
  }

  /**
   * Métodos para la galería de imágenes (copiados de detalle-local)
   */
  prevImage(): void {
    if (this.localData && this.localData.imagen_urls && this.localData.imagen_urls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.localData.imagen_urls.length) % this.localData.imagen_urls.length;
    }
  }

  nextImage(): void {
    if (this.localData && this.localData.imagen_urls && this.localData.imagen_urls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.localData.imagen_urls.length;
    }
  }

  goToImage(index: number): void {
    if (this.localData && this.localData.imagen_urls && index >= 0 && index < this.localData.imagen_urls.length) {
      this.currentImageIndex = index;
    }
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://placehold.co/600x400/ADD8E6/000000?text=Imagen+No+Disponible';
    console.warn('Error al cargar la imagen:', imgElement.src);
  }

  /**
   * Método para generar URLs de redes sociales (copiado de detalle-local)
   */
  getSocialLink(platform: string, usernameOrUrl: string | undefined | null): string {
    if (!usernameOrUrl) {
      return '#';
    }
    if (usernameOrUrl.startsWith('http://') || usernameOrUrl.startsWith('https://')) {
      return usernameOrUrl;
    }
    const cleanedUsername = usernameOrUrl.startsWith('@') ? usernameOrUrl.substring(1) : usernameOrUrl;
    switch (platform.toLowerCase()) {
      case 'facebook':
        return `https://www.facebook.com/${cleanedUsername}`;
      case 'instagram':
        return `https://www.instagram.com/${cleanedUsername}`;
      case 'tiktok':
        return `https://www.tiktok.com/@${cleanedUsername}`;
      default:
        return '#';
    }
  }
  
  /**
   * Métodos para la navegación del dashboard
   */
  irAProductos(): void {
    this.router.navigate(['/comerciantes/productos']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
