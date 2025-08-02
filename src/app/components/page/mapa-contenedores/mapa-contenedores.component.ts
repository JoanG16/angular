import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Importar servicios y interfaces
import { ContenedoresService } from '../../../services/administrador/contenedores.service';
import { LocalesService } from '../../../services/administrador/locales.service';
import { CategoriaService } from '../../../services/administrador/categoria.service';
import { ProductoService } from '../../../services/administrador/producto.service';

import { Contenedor } from '../../../interfaces/contenedor.interface';
import { Local } from '../../../interfaces/locales.interface';
import { Categoria } from '../../../interfaces/categoria.interface';
import { Producto } from '../../../interfaces/producto.interface';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// --- Interfaces para el componente interno (datos fusionados) ---

// Represents a Product with its complete Category
interface IMergedProduct extends Producto {
  categoria_obj?: Categoria; // The category associated with the product
}

// Represents a Local with its merged Products (including their categories)
interface IMergedLocal extends Local {
  productos_vendidos?: IMergedProduct[]; // Products sold by this local
}

// Represents a Container with its merged Locals (which in turn have products and categories)
interface IMergedContenedor extends Contenedor {
  locales?: IMergedLocal[]; // List of locals within this container
  leafletPolygon?: L.Polygon; // Reference to the L.Polygon object on the map
}

// Interfaz para la leyenda de colores (se mantiene por si decides usarla de otra forma)
interface BlockLegend {
  bloque: string;
  borderColor: string;
  fillColor: string;
}

@Component({
  selector: 'app-mapa-contenedores',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './mapa-contenedores.component.html',
  styleUrls: ['./mapa-contenedores.component.css']
})
export class MapaContenedoresComponent implements OnInit, OnDestroy {

  private map!: L.Map;
  // Define the map's size and bounds for Leaflet
  private width = 1137;
  private height = 640;
  private imageBounds: L.LatLngBoundsExpression = [[0, 0], [this.height, this.width]];

  // List of all loaded and merged containers
  allContenedores: IMergedContenedor[] = [];
  // Selected container to display information in the right panel
  contenedorSeleccionado: IMergedContenedor | null = null;
  // Reference to the currently highlighted polygon on the map (para clic individual)
  private highlightedLayer: L.Polygon | null = null;

  // Propiedad para controlar si hay filtros activos
  private filtersActive: boolean = false;

  // Properties for filters
  searchTerm: string = '';
  selectedCategory: string = '';

  // Available category options for the selector, will be populated dynamically
  categoriasDisponibles: string[] = [];
  // To show a loading state
  isLoading: boolean = true;

  // --- Properties for polygon colors per block ---
  private blockColorMap: Map<string, { border: string, fill: string }> = new Map([
    // Tus colores originales y los mapeo a los bloques
    ['a', { border: '#3e4077', fill: '#6a73a3' }],     // Azul oscuro para borde, azul medio para relleno
    ['b', { border: '#17a2b8', fill: '#66ccdd' }],     // Azul claro para borde, cian claro para relleno
    ['c', { border: '#aca46cff', fill: '#cfd39eff' }], // Verde oliva para borde, verde claro para relleno
    ['d', { border: '#a75f28ff', fill: '#d9a07aff' }], // Naranja oscuro para borde, naranja claro para relleno
    ['e', { border: '#42c1a3ff', fill: '#92e5bdff' }], // Turquesa para borde, verde menta para relleno
    ['f', { border: '#dc3545', fill: '#f5a7b0' }],     // Rojo teja para borde, rojo suave para relleno
    ['g', { border: '#ce3673ff', fill: '#e59ac9ff' }], // Morado rojizo para borde, rosa claro para relleno
    ['h', { border: '#5e07ffff', fill: '#7d8cfdff' }]  // Morado vibrante para borde, azul lavanda para relleno
  ]);

  // Propiedad para la leyenda de colores (se mantiene, aunque no se usa en HTML actualmente)
  blockLegends: BlockLegend[] = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contenedoresService: ContenedoresService,
    private localesService: LocalesService,
    private categoriaService: CategoriaService,
    private productoService: ProductoService
  ) { }

  ngOnInit(): void {
    this.initMap();
    this.cargarDatosCombinados();
    // Inicializa la leyenda de bloques al cargar el componente
    this.blockLegends = Array.from(this.blockColorMap.entries()).map(([bloque, colors]) => ({
      bloque: bloque.toUpperCase(),
      borderColor: colors.border,
      fillColor: colors.fill
    }));
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Initializes the Leaflet map with the background image.
   */
  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 1,
      zoomControl: true, // Habilitar los controles de zoom por defecto de Leaflet
      maxBounds: this.imageBounds,
      maxBoundsViscosity: 1.0
    });

    L.imageOverlay('/assets/nuevomercado.png', this.imageBounds).addTo(this.map);
    this.map.fitBounds(this.imageBounds);
    this.map.setView([this.height / 2, this.width / 2], 0);
  }

  /**
   * Loads all data (Containers, Locals, Products, Categories) and merges them.
   */
  private cargarDatosCombinados(): void {
    this.isLoading = true;

    forkJoin([
      this.contenedoresService.getAllContenedores(),
      this.localesService.getAllLocales(),
      this.productoService.getAllProductos(),
      this.categoriaService.getAllCategorias()
    ]).subscribe({
      next: ([contenedoresResponse, locales, productos, categorias]) => {
        const contenedores = contenedoresResponse.data;
        console.log('Raw containers:', contenedores);
        console.log('Raw locals:', locales);
        console.log('Raw products:', productos);
        console.log('Raw categories:', categorias);

        this.allContenedores = this.mergeData(contenedores, locales, productos, categorias);

        this.categoriasDisponibles = categorias.map(cat => cat.nombre_categoria);

        console.log('Merged containers (allContenedores):', this.allContenedores);
        this.renderContenedores(this.allContenedores); // Renderiza inicialmente todos los contenedores
        this.isLoading = false;

        // Leer queryParams después de cargar los datos y renderizar los contenedores
        this.route.queryParams.subscribe(params => {
          if (params['category']) {
            this.selectedCategory = params['category'];
            this.applyFilters(); // Aplicar el filtro si se pasó una categoría
          }
        });

      },
      error: (err) => {
        console.error('Error loading combined data:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Gets the border and fill colors for a given block.
   * @param bloque The block name.
   * @returns An object with 'border' and 'fill' color properties.
   */
  private getPolygonColors(bloque: string | undefined): { border: string, fill: string } {
    if (bloque && this.blockColorMap.has(bloque.toLowerCase())) { // Ensure block name is lowercase for map lookup
      return this.blockColorMap.get(bloque.toLowerCase())!;
    }
    // Default colors if the block is not defined or has no assigned color
    return { border: '#888888', fill: '#cccccc' }; // Grey default for unassigned blocks
  }

  /**
   * Merges data from containers, locals, products, and categories into a coherent structure.
   */
  private mergeData(
    contenedores: Contenedor[],
    locales: Local[],
    productos: Producto[],
    categorias: Categoria[]
  ): IMergedContenedor[] {
    const categoriasMap = new Map<number, Categoria>();
    categorias.forEach(cat => categoriasMap.set(cat.id_categoria, cat));

    const productosMap = new Map<number, IMergedProduct>();
    productos.forEach(prod => {
      productosMap.set(prod.id_producto, {
        ...prod,
        categoria_obj: categoriasMap.get(prod.id_categoria)
      });
    });

    const localesConProductos = locales.map(local => {
      const mergedLocal: IMergedLocal = { ...local };

      if ((local as any).productos && Array.isArray((local as any).productos)) {
        mergedLocal.productos_vendidos = (local as any).productos
          .map((prodFromLocal: Producto) => productosMap.get(prodFromLocal.id_producto))
          .filter((p: IMergedProduct | undefined): p is IMergedProduct => p !== undefined);
      } else {
        mergedLocal.productos_vendidos = [];
      }
      return mergedLocal;
    });

    const localesPorContenedor = new Map<number, IMergedLocal[]>();
    localesConProductos.forEach(local => {
      if (!localesPorContenedor.has(local.id_contenedor)) {
        localesPorContenedor.set(local.id_contenedor, []);
      }
      localesPorContenedor.get(local.id_contenedor)?.push(local);
    });

    return contenedores.map(contenedor => {
      const mergedContenedor: IMergedContenedor = { ...contenedor };
      mergedContenedor.locales = localesPorContenedor.get(contenedor.id_contenedor) || [];
      return mergedContenedor;
    });
  }


  /**
   * Renders containers on the map, removing previous ones if they exist.
   * This function now takes an optional 'filteredContainerIds' array to apply visual filtering.
   * @param contenedoresToRender The list of all containers to draw.
   * @param filteredContainerIds Optional: An array of container IDs that match the current filter.
   */
  private renderContenedores(contenedoresToRender: IMergedContenedor[], filteredContainerIds: number[] = []): void {
    // Eliminar solo polígonos existentes
    this.map.eachLayer(layer => {
      if (layer instanceof L.Polygon) {
        this.map.removeLayer(layer);
      }
    });
    this.highlightedLayer = null;

    // Determinar si hay algún filtro activo que no sea la búsqueda vacía
    this.filtersActive = (this.searchTerm.trim() !== '' || this.selectedCategory.trim() !== '');

    contenedoresToRender.forEach(contenedor => {
      if (contenedor.geom && contenedor.geom.coordinates && contenedor.geom.coordinates[0] && contenedor.geom.coordinates[0].length > 0) {
        const coords: [number, number][] = contenedor.geom.coordinates[0] as [number, number][];
        const latlngs: L.LatLngTuple[] = coords.map(([lng, lat]) => [lat, lng]);

        const isFiltered = filteredContainerIds.includes(contenedor.id_contenedor);
        const colors = this.getPolygonColors(contenedor.bloque);

        let polygonOptions: L.PolylineOptions;

        if (this.filtersActive && !isFiltered) {
          // Si hay filtros activos y este contenedor NO está filtrado, atenúalo
          polygonOptions = {
            color: '#555555', // Borde oscuro y sutil
            fillColor: '#333333', // Relleno oscuro
            fillOpacity: 0.1, // Muy transparente
            weight: 1, // Borde muy fino
            interactive: false // No interactuable si está atenuado
          };
        } else {
          // Si está filtrado, o no hay filtros activos, usa sus colores normales
          polygonOptions = {
            color: colors.border,
            fillColor: colors.fill,
            fillOpacity: 0.6,
            weight: 2,
            interactive: true // Interactuable
          };
        }

        const polygon = L.polygon(latlngs, polygonOptions).addTo(this.map);
        contenedor.leafletPolygon = polygon;

        const tooltipText = `Bloque: ${contenedor.bloque || 'N/A'}<br>Contenedor: ${contenedor.numero_contenedor || contenedor.id_contenedor}`;
        polygon.bindTooltip(tooltipText, { sticky: true });

        // Solo añadir el evento click si el polígono es interactuable
        if (polygonOptions.interactive) {
          polygon.on('click', () => this.onContenedorClick(contenedor));
        }
      } else {
        console.warn(`Container ${contenedor.id_contenedor} skipped due to invalid geom:`, contenedor);
      }
    });
  }

  /**
   * Applies current filters (name/product search and category) and updates the map.
   */
  applyFilters(): void {
    const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
    const lowerSelectedCategory = this.selectedCategory.toLowerCase().trim();

    // Determinar si hay algún filtro activo
    this.filtersActive = (lowerSearchTerm !== '' || lowerSelectedCategory !== '');

    let filteredContenedores = this.allContenedores.filter(contenedor => {
      const matchesContenedorNumber = lowerSearchTerm ? contenedor.numero_contenedor.toLowerCase().includes(lowerSearchTerm) : false;

      const matchesLocalOrProductName = contenedor.locales && contenedor.locales.some(local =>
        local.nombre_del_negocio.toLowerCase().includes(lowerSearchTerm) ||
        (local.productos_vendidos && local.productos_vendidos.some(product =>
          product.nombre.toLowerCase().includes(lowerSearchTerm)
        ))
      );

      const matchesCategory = !lowerSelectedCategory ||
                              (contenedor.locales && contenedor.locales.some(local =>
                                local.productos_vendidos && local.productos_vendidos.some(product =>
                                  product.categoria_obj && product.categoria_obj.nombre_categoria.toLowerCase() === lowerSelectedCategory
                                )
                              ));

      const searchConditionMet = !lowerSearchTerm || matchesContenedorNumber || matchesLocalOrProductName;

      return searchConditionMet && matchesCategory;
    });

    // Recolectar solo los IDs de los contenedores que PASARON el filtro
    const filteredContainerIds = filteredContenedores.map(c => c.id_contenedor);

    // Renderizar todos los contenedores, pero pasar la lista de IDs filtrados
    this.renderContenedores(this.allContenedores, filteredContainerIds);
    this.contenedorSeleccionado = null;
    this.clearHighlight(); // Asegurarse de que el highlight de clic individual se limpie
  }

  /**
   * Highlights a specific container on the map and centers it.
   * This highlight is for individual clicks, distinct from the filter attenuation.
   */
  highlightContenedor(contenedor: IMergedContenedor): void {
    this.clearHighlight(); // First, clear any existing highlight

    if (contenedor.leafletPolygon) {
      this.highlightedLayer = contenedor.leafletPolygon;
      // Colores de resaltado para el clic individual
      this.highlightedLayer.setStyle({
        color: 'var(--accent-color)',      // Borde: Mostaza
        fillColor: 'var(--amarillo-suave)', // Relleno: Amarillo suave
        weight: 4, // Borde más grueso para el highlight de clic
        fillOpacity: 0.9 // Opacidad más alta para el highlight de clic
      });

      if (this.highlightedLayer.getBounds().isValid()) {
        this.map.fitBounds(this.highlightedLayer.getBounds(), {
          padding: [50, 50],
          maxZoom: 0.5
        });
      }
    }
  }

  /**
   * Removes the highlight from any active container, reverting to its current state (filtered or normal).
   */
  clearHighlight(): void {
    if (this.highlightedLayer) {
      // Encuentra el contenedor original para obtener sus colores de bloque
      const originalContenedor = this.allContenedores.find(c => c.leafletPolygon === this.highlightedLayer);
      if (originalContenedor) {
        // Revertir al estilo que tendría según los filtros actuales
        const isCurrentlyFiltered = this.searchTerm.trim() !== '' || this.selectedCategory.trim() !== '';
        const isThisContainerInCurrentFilterResults = isCurrentlyFiltered &&
          this.allContenedores.filter(c => {
            const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
            const lowerSelectedCategory = this.selectedCategory.toLowerCase().trim();

            const matchesContenedorNumber = lowerSearchTerm ? c.numero_contenedor.toLowerCase().includes(lowerSearchTerm) : false;
            const matchesLocalOrProductName = c.locales && c.locales.some(local =>
              local.nombre_del_negocio.toLowerCase().includes(lowerSearchTerm) ||
              (local.productos_vendidos && local.productos_vendidos.some(product =>
                product.nombre.toLowerCase().includes(lowerSearchTerm)
              ))
            );
            const matchesCategory = !lowerSelectedCategory ||
                                    (c.locales && c.locales.some(local =>
                                      local.productos_vendidos && local.productos_vendidos.some(product =>
                                        product.categoria_obj && product.categoria_obj.nombre_categoria.toLowerCase() === lowerSelectedCategory
                                      )
                                    ));
            const searchConditionMet = !lowerSearchTerm || matchesContenedorNumber || matchesLocalOrProductName;
            return searchConditionMet && matchesCategory;
          }).map(c => c.id_contenedor).includes(originalContenedor.id_contenedor);


        if (isCurrentlyFiltered && !isThisContainerInCurrentFilterResults) {
          // Si hay filtros activos y este contenedor NO está en los resultados del filtro
          this.highlightedLayer.setStyle({
            color: '#555555',
            fillColor: '#333333',
            fillOpacity: 0.1,
            weight: 1,
            interactive: false
          });
        } else {
          // Si está en los resultados del filtro o no hay filtros activos, usa sus colores normales
          const colors = this.getPolygonColors(originalContenedor.bloque);
          this.highlightedLayer.setStyle({
            color: colors.border,
            fillColor: colors.fill,
            fillOpacity: 0.6,
            weight: 2,
            interactive: true
          });
        }
      } else {
        // Fallback si por alguna razón el contenedor original no se encuentra
        this.highlightedLayer.setStyle({
          color: '#888888',
          fillColor: '#cccccc',
          fillOpacity: 0.6,
          weight: 2,
          interactive: true
        });
      }
      this.highlightedLayer = null;
    }
  }

  /**
   * Event handler when a container polygon is clicked.
   */
  onContenedorClick(contenedor: IMergedContenedor): void {
    console.log('Container clicked:', contenedor);
    this.contenedorSeleccionado = contenedor;
    this.highlightContenedor(contenedor);
  }

  /**
   * Clears filters and displays all containers again.
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.contenedorSeleccionado = null;
    this.clearHighlight(); // Asegurarse de limpiar cualquier highlight de clic
    this.filtersActive = false; // Restablecer el estado de filtros activos
    this.renderContenedores(this.allContenedores); // Renderizar todos con sus estilos normales
    this.map.fitBounds(this.imageBounds);
  }

  /**
   * Redirects to the local detail page.
   * @param localId The ID of the local to view details for.
   */
  verDetalleLocal(localId: number): void {
    console.log('Redirigiendo a detalles del local:', localId);
    this.router.navigate(['/detalle-local', localId]);
  }
}
