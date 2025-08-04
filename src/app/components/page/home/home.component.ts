// src/app/components/page/home/home.component.ts
import { Component, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core'; // Añadir ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../../safe-url.pipe';
import { Router } from '@angular/router';

// Importar el servicio de ofertas y la interfaz
import { OfertaService } from '../../../services/administrador/ofertas.service';
import { Oferta } from '../../../interfaces/oferta.interface';

// Declarar window.tiktok para que TypeScript no se queje
declare global {
  interface Window {
    tiktok: any;
  }
}

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

  tiktokVideos: string[] = [];
  youtubeUrls: string[] = [];
  promociones: { promocion: string }[] = [];

  currentSlideIndex: number = 0; // Para el carrusel de TikTok
  tiktokVideosPerPage: number = 3; // Valor inicial, ajustado por CSS/JS

  currentIndex: number = 0; // Para el carrusel de YouTube
  videosPerPage: number = 2; // Valor inicial, ajustado por CSS/JS

  comentarioActual = 0;
  private intervalo: any;

  // Estado de carga para los videos de TikTok
  tiktokVideosLoading: boolean = true;
  // Bandera para saber si el script de TikTok ya fue añadido al DOM
  private tiktokEmbedScriptAdded: boolean = false;
  // Mensaje de error para TikTok
  tiktokErrorMessage: string | null = null;


  comentarios = [
    { texto: 'Es un lugar increíble para hacer las compras diarias, todo está bien organizado.', autor: 'María Fernanda Gómez' },
    { texto: 'Excelente atención por parte de los comerciantes. Muy buena experiencia.', autor: 'Carlos Jaramillo' },
    { texto: 'Encuentro productos frescos y a buen precio. Lo recomiendo totalmente.', autor: 'Lorena Cedeño' },
    { texto: 'Me gusta mucho que hay variedad y todo está limpio y seguro.', autor: 'Luis Montalvo' },
    { texto: 'Uno de los mejores lugares comerciales de la ciudad. Buen ambiente familiar.', autor: 'Andrés Velázquez' }
  ];

  constructor(
    private router: Router,
    private ofertaService: OfertaService,
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarOfertas();

    this.intervalo = setInterval(() => {
      this.comentarioActual = (this.comentarioActual + 1) % this.comentarios.length;
    }, 4000);
  }

  ngAfterViewInit(): void {
    // Solución NG0100: Envolver en setTimeout para el siguiente ciclo de detección de cambios
    setTimeout(() => {
      this.adjustCarouselSettings();
      this.cdr.detectChanges(); // Forzar detección de cambios después de ajustar
    }, 0);
    
    window.addEventListener('resize', this.adjustCarouselSettings.bind(this));

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observerInstance.unobserve(entry.target);
        }
      });
    }, options);

    const animatedElements = document.querySelectorAll('.animated');
    animatedElements.forEach(el => observer.observe(el));

    const video = document.getElementById('header-video') as HTMLVideoElement;
    if (video) {
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      setTimeout(() => {
        video.play().then(() => {
          console.log('Autoplay ok');
        }).catch((error) => {
          console.warn('Autoplay bloqueado por el navegador:', error);
        });
      }, 0);
    }
  }


  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    window.removeEventListener('resize', this.adjustCarouselSettings.bind(this));
  }

  cargarOfertas(): void {
    this.tiktokVideosLoading = true;
    this.tiktokErrorMessage = null; // Limpiar cualquier mensaje de error previo

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
        console.log('URLs de TikTok cargadas para incrustar:', this.tiktokVideos);

        this.currentSlideIndex = 0;
        this.currentIndex = 0;
        
        // Solución NG0100: Envolver en setTimeout para el siguiente ciclo de detección de cambios
        setTimeout(() => {
          this.adjustCarouselSettings();
          this.cdr.detectChanges(); // Forzar detección de cambios después de ajustar
        }, 0);


        console.log('Ofertas cargadas y distribuidas:', {
          promociones: this.promociones,
          tiktokVideos: this.tiktokVideos,
          youtubeUrls: this.youtubeUrls
        });

        if (this.tiktokVideos.length > 0) {
          this.loadTikTokEmbeds();
        } else {
          this.tiktokVideosLoading = false; // Si no hay videos, ocultar spinner inmediatamente
        }
      },
      error: (err) => {
        console.error('Error al cargar las ofertas:', err);
        this.tiktokVideosLoading = false;
        this.tiktokErrorMessage = 'Error al cargar los videos de TikTok. Por favor, inténtalo de nuevo más tarde.';
      }
    });
  }

  /**
   * Carga el script de TikTok y le indica que procese los embeds,
   * esperando a que la función `window.tiktok.embed.load` esté disponible.
   */
  loadTikTokEmbeds(): void {
    if (this.tiktokVideos.length === 0) {
      this.tiktokVideosLoading = false;
      return; // No hay videos para cargar
    }

    if (!this.tiktokEmbedScriptAdded) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.id = 'tiktok-embed-script';
      script.onerror = (error) => {
        console.error('Error loading TikTok embed script:', error);
        this.tiktokVideosLoading = false;
        this.tiktokErrorMessage = 'No se pudo cargar el script de TikTok. Verifica tu conexión a internet.';
        this.cdr.detectChanges(); // Forzar detección de cambios para mostrar el error
      };
      document.body.appendChild(script);
      this.tiktokEmbedScriptAdded = true;
    }

    let attempts = 0;
    const maxAttempts = 40; // Aumentar a 40 intentos (40 * 500ms = 20 segundos)
    const intervalTime = 500; // Cada 500ms

    const checkTikTokEmbed = setInterval(() => {
      attempts++;
      if (window.tiktok && window.tiktok.embed && typeof window.tiktok.embed.load === 'function') {
        clearInterval(checkTikTokEmbed);
        console.log('TikTok embed script and function are ready. Loading embeds.');
        window.tiktok.embed.load();
        // Dar un tiempo más prudente para que los iframes comiencen a renderizarse
        setTimeout(() => {
          this.tiktokVideosLoading = false;
          this.cdr.detectChanges(); // Forzar detección de cambios para ocultar el spinner
        }, 2500); // Aumentado a 2.5 segundos
      } else if (attempts >= maxAttempts) {
        clearInterval(checkTikTokEmbed);
        console.warn('TikTok embed.load did not become available after multiple attempts.');
        this.tiktokVideosLoading = false;
        this.tiktokErrorMessage = 'Los videos de TikTok tardan demasiado en cargar o no están disponibles.';
        this.cdr.detectChanges(); // Forzar detección de cambios para mostrar el error
      } else {
        console.log(`Attempt ${attempts} to load TikTok embeds...`);
      }
    }, intervalTime);
  }


  nextTiktokVideo(): void {
    if (this.currentSlideIndex < this.tiktokVideos.length - this.tiktokVideosPerPage) {
      this.currentSlideIndex++;
    } else {
      this.currentSlideIndex = 0;
    }
  }

  prevTiktokVideo(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else {
      this.currentSlideIndex = Math.max(0, this.tiktokVideos.length - this.tiktokVideosPerPage);
    }
  }


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

  adjustCarouselSettings(): void {
    if (window.innerWidth <= 768) {
      this.tiktokVideosPerPage = 1;
      this.videosPerPage = 1;
    } else if (window.innerWidth <= 1200) {
      this.tiktokVideosPerPage = 2;
      this.videosPerPage = 2;
    } else {
      this.tiktokVideosPerPage = 3;
      this.videosPerPage = 2;
    }

    if (this.currentSlideIndex + this.tiktokVideosPerPage > this.tiktokVideos.length) {
      this.currentSlideIndex = Math.max(0, this.tiktokVideos.length - this.tiktokVideosPerPage);
    }
    if (this.currentIndex + this.videosPerPage > this.youtubeUrls.length) {
      this.currentIndex = Math.max(0, this.youtubeUrls.length - this.videosPerPage);
    }

    // Actualizar las variables CSS
    document.documentElement.style.setProperty('--videos-per-page-tiktok', this.tiktokVideosPerPage.toString());
    document.documentElement.style.setProperty('--total-videos-tiktok', this.tiktokVideos.length.toString());
  }

  getVideoId(url: string): string {
    const longUrlMatch = url.match(/\/video\/(\d+)/);
    if (longUrlMatch && longUrlMatch[1]) {
      return longUrlMatch[1];
    }
    return '';
  }

  irAPagina(path: string, category: string | null = null): void {
    const navigationExtras = category ? { queryParams: { category: category } } : {};
    this.router.navigate([path], navigationExtras);
  }
}
