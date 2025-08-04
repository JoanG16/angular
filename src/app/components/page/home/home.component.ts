// src/app/components/page/home/home.component.ts
import { Component, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, HostListener } from '@angular/core'; // Añadir HostListener
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../../safe-url.pipe';
import { Router } from '@angular/router';

// NUEVO: Importar el servicio de ofertas y la interfaz
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

  tiktokVideos: string[] = []; // Se poblará desde tiktokVideosCargados
  youtubeUrls: string[] = []; // Se poblará desde youtubeUrlsCargados
  promociones: { promocion: string }[] = []; // Se poblará desde promocionesCargadas

  // Renombra currentTiktokIndex a currentSlideIndex para que coincida con el HTML
  currentSlideIndex: number = 0; // Este es para el carrusel de TikTok
  tiktokVideosPerPage: number = 3; // Valor inicial, ajustado por CSS/JS

  currentIndex: number = 0; // Este es para el carrusel de YouTube
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
  // Ajustar videosPerPage en función del tamaño de la pantalla
  this.adjustCarouselSettings();
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

  // ✅ Forzar reproducción automática del video una vez montado el DOM
  const video = document.getElementById('header-video') as HTMLVideoElement;
  if (video) {
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    // Esperar al siguiente tick del DOM para asegurar carga completa
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
    window.removeEventListener('resize', this.adjustCarouselSettings.bind(this)); // Cambiado aquí también
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
        console.log('URLs de TikTok cargadas para incrustar:', this.tiktokVideos);

        // Reiniciar índices de carrusel después de cargar y ajustar vistas
        this.currentSlideIndex = 0; // Para TikTok
        this.currentIndex = 0; // Para YouTube
        this.adjustCarouselSettings(); // Ajustar configuración de carrusel

        console.log('Ofertas cargadas y distribuidas:', {
          promociones: this.promociones,
          tiktokVideos: this.tiktokVideos,
          youtubeUrls: this.youtubeUrls
        });

        // Cargar y procesar los embeds de TikTok después de que los datos estén disponibles
        this.loadTikTokEmbeds();
      },
      error: (err) => {
        console.error('Error al cargar las ofertas:', err);
      }
    });
  }

  /**
   * Carga el script de TikTok y le indica que procese los embeds.
   * Se llama después de que los videos de TikTok son cargados.
   */
  loadTikTokEmbeds(): void {
    // Solo cargar el script si hay videos de TikTok y no se ha cargado ya
    if (this.tiktokVideos.length > 0 && !document.getElementById('tiktok-embed-script')) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.id = 'tiktok-embed-script'; // Añadir un ID para evitar recargas
      script.onload = () => {
        // Asegurarse de que el objeto tiktok.embed esté disponible
        if (window.tiktok && window.tiktok.embed && typeof window.tiktok.embed.load === 'function') {
          console.log('TikTok embed script loaded. Attempting to load embeds.');
          window.tiktok.embed.load(); // Le dice a TikTok que busque nuevos embeds
        } else {
          console.warn('window.tiktok.embed.load is not available yet.');
        }
      };
      script.onerror = (error) => {
        console.error('Error loading TikTok embed script:', error);
      };
      document.body.appendChild(script);
    } else if (this.tiktokVideos.length > 0 && document.getElementById('tiktok-embed-script')) {
      // Si el script ya está cargado, solo intentar recargar los embeds
      if (window.tiktok && window.tiktok.embed && typeof window.tiktok.embed.load === 'function') {
        console.log('TikTok embed script already loaded. Reloading embeds.');
        window.tiktok.embed.load();
      }
    }
  }


  // Métodos de navegación para TikTok
  // Ya no necesitas visibleTiktokVideos si el transform se encarga de todo
  // get visibleTiktokVideos(): string[] {
  //   const startIndex = this.currentSlideIndex;
  //   const endIndex = startIndex + this.tiktokVideosPerPage;
  //   return this.tiktokVideos.slice(startIndex, endIndex);
  // }

  nextTiktokVideo(): void {
    // Asegúrate de que el índice no supere el número total de videos menos los videos por página
    if (this.currentSlideIndex < this.tiktokVideos.length - this.tiktokVideosPerPage) {
      this.currentSlideIndex++;
      console.log('nextTiktokVideo: currentSlideIndex =', this.currentSlideIndex);
    } else {
      // Si llegamos al final, volvemos al principio
      this.currentSlideIndex = 0;
      console.log('nextTiktokVideo: Reiniciado a 0');
    }
  }

  prevTiktokVideo(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      console.log('prevTiktokVideo: currentSlideIndex =', this.currentSlideIndex);
    } else {
      // Si estamos en el principio, vamos al final (o al último conjunto visible)
      this.currentSlideIndex = Math.max(0, this.tiktokVideos.length - this.tiktokVideosPerPage);
      console.log('prevTiktokVideo: Reiniciado al final (o último conjunto visible) =', this.currentSlideIndex);
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

  // Renombrada la función para ser más genérica, ya que ajusta settings para ambos carruseles
  adjustCarouselSettings(): void {
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
    // Asegurar que los índices actuales no excedan los límites después del ajuste
    if (this.currentSlideIndex + this.tiktokVideosPerPage > this.tiktokVideos.length) {
      this.currentSlideIndex = Math.max(0, this.tiktokVideos.length - this.tiktokVideosPerPage);
    }
    if (this.currentIndex + this.videosPerPage > this.youtubeUrls.length) {
      this.currentIndex = Math.max(0, this.youtubeUrls.length - this.videosPerPage);
    }
  }

  /**
   * Extrae el ID numérico de un URL de TikTok.
   * Asume URLs como:
   * - https://www.tiktok.com/@username/video/1234567890123456789
   * - https://vm.tiktok.com/ZM839dG/ (Para estas, el ID no es numérico, TikTok las maneja por el cite)
   * Devolverá el ID numérico si lo encuentra, de lo contrario, una cadena vacía.
   */
  getVideoId(url: string): string {
    // Intenta extraer el ID numérico de URLs largas
    const longUrlMatch = url.match(/\/video\/(\d+)/);
    if (longUrlMatch && longUrlMatch[1]) {
      return longUrlMatch[1];
    }

    // Para URLs cortas como vm.tiktok.com, TikTok embed script a menudo solo necesita el 'cite'
    // No extraemos un 'data-video-id' numérico en este caso, el script lo resolverá.
    // Si necesitas un ID único para cada video en tu lógica interna, podrías generar uno.
    return ''; // Devuelve vacío si no es una URL con ID numérico explícito
  }

  // Método irAPagina actualizado para aceptar un parámetro de categoría
  irAPagina(path: string, category: string | null = null): void {
    const navigationExtras = category ? { queryParams: { category: category } } : {};
    this.router.navigate([path], navigationExtras);
  }

  
}