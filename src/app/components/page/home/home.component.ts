import { Component, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../../safe-url.pipe';
import { Router } from '@angular/router';

// NUEVO: Importar el servicio de ofertas y la interfaz
import { OfertaService } from '../../../services/administrador/ofertas.service';
import { Oferta } from '../../../interfaces/oferta.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnInit, OnDestroy {
  promocionesCargadas: Oferta[] = [];
  tiktokVideosCargados: Oferta[] = [];
  youtubeUrlsCargados: Oferta[] = [];

  tiktokVideos: string[] = []; // Se poblará desde tiktokVideosCargados
  youtubeUrls: string[] = []; // Se poblará desde youtubeUrlsCargados
  promociones: { promocion: string }[] = []; // Se poblará desde promocionesCargadas

  currentTiktokIndex: number = 0;
  tiktokVideosPerPage: number = 3; // Valor inicial, ajustado por CSS/JS

  currentIndex: number = 0;
  videosPerPage: number = 2; // Valor inicial, ajustado por CSS/JS

  comentarioActual = 0;
  private intervalo: any;

  comentarios = [
    { texto: 'Es un lugar increíble para hacer las compras diarias, todo está bien organizado.', autor: 'María Fernanda Gómez' },
    { texto: 'Excelente atención por parte de los comerciantes. Muy buena experiencia.', autor: 'Carlos Jaramillo' },
    { texto: 'Encuentro productos frescos y a buen precio. Lo recomiendo totalmente.', autor: 'Lorena Cedeño' },
    { texto: 'Me gusta mucho que hay variedad y todo está limpio y seguro.', autor: 'Luis Montalvo' },
    { texto: 'Uno de los mejores lugares comerciales de la ciudad. Buen ambiente familiar.', autor: 'Andrés Velázquez' }
  ];

  constructor(
    private router: Router,
    private ofertaService: OfertaService
  ) { }

  ngOnInit(): void {
    this.cargarOfertas();

    this.intervalo = setInterval(() => {
      this.comentarioActual = (this.comentarioActual + 1) % this.comentarios.length;
    }, 4000);
  }

  ngAfterViewInit(): void {

   const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // Ajustar videosPerPage en función del tamaño de la pantalla
    this.adjustVideosPerPage();
    window.addEventListener('resize', this.adjustVideosPerPage.bind(this));

    const options = {
      root: null, // El viewport del navegador
      rootMargin: '0px',
      threshold: 0.1 // Se activa cuando el 10% del elemento es visible
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Añade la clase 'is-visible' al elemento que entró en la pantalla
          entry.target.classList.add('is-visible');
          // Una vez animado, deja de observarlo para mejorar el rendimiento
          observerInstance.unobserve(entry.target);
        }
      });
    }, options);

    // Selecciona todos los elementos que quieres animar y ponlos a observar
    const animatedElements = document.querySelectorAll('.animated');
    animatedElements.forEach(el => observer.observe(el));
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    window.removeEventListener('resize', this.adjustVideosPerPage.bind(this));
  }

  cargarOfertas(): void {
    this.ofertaService.getAllOfertas().subscribe({
      next: (ofertas: Oferta[]) => {
        this.promocionesCargadas = ofertas.filter(o => o.tipo_contenido === 'promocion' && o.activo);
        this.tiktokVideosCargados = ofertas.filter(o => o.tipo_contenido === 'tiktok' && o.activo);
        this.youtubeUrlsCargados = ofertas.filter(o => o.tipo_contenido === 'youtube' && o.activo);

        this.promociones = this.promocionesCargadas
                               .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                               .map(o => ({ promocion: o.valor_contenido }));

        this.tiktokVideos = this.tiktokVideosCargados
                                 .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                                 .map(o => o.valor_contenido);

        this.youtubeUrls = this.youtubeUrlsCargados
                               .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                               .map(o => o.valor_contenido);

        console.log('URLs de YouTube cargadas para incrustar:', this.youtubeUrls);

        // Reiniciar índices de carrusel después de cargar y ajustar vistas
        this.currentTiktokIndex = 0;
        this.currentIndex = 0;
        this.adjustVideosPerPage();
        console.log('Ofertas cargadas y distribuidas:', {
          promociones: this.promociones,
          tiktokVideos: this.tiktokVideos,
          youtubeUrls: this.youtubeUrls
        });
      },
      error: (err) => {
        console.error('Error al cargar las ofertas:', err);
      }
    });
  }

  // Métodos de navegación para TikTok
  get visibleTiktokVideos(): string[] {
    const startIndex = this.currentTiktokIndex;
    const endIndex = startIndex + this.tiktokVideosPerPage;
    return this.tiktokVideos.slice(startIndex, endIndex);
  }

  nextTiktokVideo(): void {
    if (this.currentTiktokIndex + this.tiktokVideosPerPage < this.tiktokVideos.length) {
      this.currentTiktokIndex++;
    } else {
      // Para un carrusel que no es infinito y va al final
      this.currentTiktokIndex = Math.max(0, this.tiktokVideos.length - this.tiktokVideosPerPage);
    }
  }

  prevTiktokVideo(): void {
    if (this.currentTiktokIndex > 0) {
      this.currentTiktokIndex--;
    } else {
      // Para un carrusel que no es infinito y va al final
      this.currentTiktokIndex = Math.max(0, this.tiktokVideos.length - this.tiktokVideosPerPage);
    }
  }

  // Métodos de navegación para YouTube
  get visibleVideos(): string[] {
    return this.youtubeUrls.slice(this.currentIndex, this.currentIndex + this.videosPerPage);
  }

  nextVideo() {
    if (this.currentIndex + this.videosPerPage < this.youtubeUrls.length) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  prevVideo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = Math.max(0, this.youtubeUrls.length - this.videosPerPage);
    }
  }

  adjustVideosPerPage(): void {
    if (window.innerWidth <= 768) { // Mobile and small tablets
      this.tiktokVideosPerPage = 1;
      this.videosPerPage = 1;
    } else if (window.innerWidth <= 1200) { // Medium screens (large tablets, small laptops)
      this.tiktokVideosPerPage = 2;
      this.videosPerPage = 2;
    } else { // Desktop
      this.tiktokVideosPerPage = 3;
      this.videosPerPage = 2;
    }
    // Asegurar que el índice actual no exceda los límites después del ajuste
    if (this.currentTiktokIndex + this.tiktokVideosPerPage > this.tiktokVideos.length) {
      this.currentTiktokIndex = Math.max(0, this.tiktokVideos.length - this.tiktokVideosPerPage);
    }
    if (this.currentIndex + this.videosPerPage > this.youtubeUrls.length) {
      this.currentIndex = Math.max(0, this.youtubeUrls.length - this.videosPerPage);
    }
  }

  getVideoId(url: string): string {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : '';
  }

  // Método irAPagina actualizado para aceptar un parámetro de categoría
  irAPagina(path: string, category: string | null = null): void {
    const navigationExtras = category ? { queryParams: { category: category } } : {};
    this.router.navigate([path], navigationExtras);
  }
}
