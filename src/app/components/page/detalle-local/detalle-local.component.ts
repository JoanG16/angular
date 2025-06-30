// src/app/components/page/detalle-local/detalle-local.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router'; // Importa RouterLink aquí
import { CommonModule, DatePipe } from '@angular/common';
import { LocalesService } from '../../../services/administrador/locales.service';
import { Local } from '../../../interfaces/locales.interface';
import { Producto } from '../../../interfaces/producto.interface';
import { Categoria } from '../../../interfaces/categoria.interface';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-detalle-local',
  standalone: true,
  imports: [CommonModule, DatePipe, HttpClientModule, RouterLink], // Añade RouterLink a los imports
  templateUrl: './detalle-local.component.html',
  styleUrls: ['./detalle-local.component.css']
})
export class DetalleLocalComponent implements OnInit, OnDestroy {
  local: Local | null = null;
  currentImageIndex: number = 0;
  backendBaseUrl: string = 'http://localhost:3000';
  currentYear: number = new Date().getFullYear();

  private routeSubscription: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localesService: LocalesService
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.getLocalDetails(parseInt(id, 10));
      } else {
        console.error('No se proporcionó un ID de local en los parámetros de la ruta.');
        this.router.navigate(['/locales']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  getLocalDetails(id: number): void {
    this.localesService.getOneLocal(id).subscribe({
      next: (data: Local) => {
        this.local = data;
        console.log('Detalles del local cargados:', this.local);
        if (this.local.imagen_urls && this.local.imagen_urls.length > 0) {
          this.currentImageIndex = 0;
        }
      },
      error: (err) => {
        console.error('Error al cargar los detalles del local:', err);
        this.local = null;
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

  goBack(): void {
    this.router.navigate(['/mapa_contenedores']);
  }
}
