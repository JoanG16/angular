// src/app/components/locales/locales.component.ts
import { Component, OnInit } from '@angular/core';
import { LocalesService } from '../../../services/page/locales.service';
import { ContenedoresService } from '../../../services/administrador/contenedores.service';
import { Local, LocalResponse } from '../../../interfaces/locales.interface';
import { Contenedor, ContenedorResponse } from '../../../interfaces/contenedor.interface';
import { Producto } from '../../../interfaces/producto.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Extender la interfaz Local para incluir el nombre del bloque para la vista
interface LocalConBloque extends Local {
  nombre_bloque?: string; // Propiedad para el nombre del bloque
  truncatedDescripcion?: string; // Para el texto cortado
  isExpanded?: boolean; // Para controlar si el texto está expandido (true = mostrar completo, false = mostrar truncado)
}

@Component({
  selector: 'app-locales',
  templateUrl: './locales.component.html',
  styleUrls: ['./locales.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class LocalComponent implements OnInit { // Asegúrate de que el nombre de tu clase sea LocalesComponent si lo cambiaste
  allLocales: LocalConBloque[] = []; // Todos los locales crudos del backend (incluye duplicados por nombre)
  uniqueLocalesByName: LocalConBloque[] = []; // Locales únicos por nombre de negocio
  filteredLocales: LocalConBloque[] = []; // Locales filtrados y ordenados (basados en uniqueLocalesByName)

  searchTerm: string = '';
  blockFilter: string = '';
  categoryFilter: string = '';
  sortBy: string = 'nombre_asc';

  private searchSubject = new Subject<string>();

  uniqueCategories: string[] = [];
  uniqueBlocks: string[] = [];
  allContenedores: Contenedor[] = [];

  // Define la longitud máxima para la descripción antes de truncar
  public readonly DESCRIPTION_MAX_LENGTH = 150;

  constructor(
    private localesService: LocalesService,
    private contenedoresService: ContenedoresService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCombinedData();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.applyFiltersAndSort();
    });
  }

  loadCombinedData(): void {
    forkJoin({
      localesResponse: this.localesService.getLocales(),
      contenedoresResponse: this.contenedoresService.getAllContenedores()
    }).subscribe({
      next: ({ localesResponse, contenedoresResponse }: { localesResponse: LocalResponse, contenedoresResponse: ContenedorResponse }) => {
        this.allContenedores = contenedoresResponse.data;

        if (localesResponse.statusCode === 200 && localesResponse.status === 'Success') {
          const rawLocalesWithBlocks: LocalConBloque[] = localesResponse.data.map((local: Local) => {
            const contenedor = this.allContenedores.find(c => c.id_contenedor === local.id_contenedor);
            const fullDescription = local.descripcion || 'No hay descripción disponible.';
            const isTooLong = fullDescription.length > this.DESCRIPTION_MAX_LENGTH;

            return {
              ...local,
              nombre_bloque: contenedor ? contenedor.bloque : 'N/A',
              descripcion: fullDescription, // Mantenemos la descripción completa
              truncatedDescripcion: isTooLong ? fullDescription.substring(0, this.DESCRIPTION_MAX_LENGTH) + '...' : fullDescription,
              isExpanded: false // Inicialmente no expandido
            };
          });

          // Filtrar para obtener locales únicos por nombre de negocio
          const seenNames = new Set<string>();
          this.uniqueLocalesByName = [];
          rawLocalesWithBlocks.forEach(local => {
            // Convertir a minúsculas para una comparación sin distinción de mayúsculas/minúsculas
            if (!seenNames.has(local.nombre_del_negocio.toLowerCase())) {
              seenNames.add(local.nombre_del_negocio.toLowerCase());
              this.uniqueLocalesByName.push(local);
            }
          });

          // Ahora, aplicar filtros y ordenamiento sobre los locales únicos por nombre
          this.extractUniqueFilters(); // Esto usará uniqueLocalesByName para extraer los filtros
          this.applyFiltersAndSort(); // Esto filtrará y ordenará uniqueLocalesByName, asignando a filteredLocales

          console.log('Locales cargados exitosamente (únicos por nombre):', this.uniqueLocalesByName);
          console.log('Contenedores cargados exitosamente:', this.allContenedores);
        } else {
          console.error('Error al cargar locales (condición no cumplida):', localesResponse.message);
        }
      },
      error: (err: any) => {
        console.error('Error en la petición de datos combinados:', err);
      }
    });
  }

  extractUniqueFilters(): void {
    const categories = new Set<string>();
    const blocks = new Set<string>();

    // Iterar sobre uniqueLocalesByName para extraer las categorías y bloques únicos
    this.uniqueLocalesByName.forEach(local => {
      local.productos?.forEach(producto => {
        if (producto.categoria?.nombre_categoria) {
          categories.add(producto.categoria.nombre_categoria);
        }
      });

      if (local.nombre_bloque && local.nombre_bloque !== 'N/A') {
        blocks.add(local.nombre_bloque);
      }
    });

    this.uniqueCategories = Array.from(categories).sort();
    this.uniqueBlocks = Array.from(blocks).sort();
  }

  applyFiltersAndSort(): void {
    // Los filtros y el ordenamiento ahora se aplican sobre uniqueLocalesByName
    let tempLocales = [...this.uniqueLocalesByName];

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempLocales = tempLocales.filter(local =>
        local.nombre_del_negocio.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (this.blockFilter) {
      tempLocales = tempLocales.filter(local =>
        local.nombre_bloque === this.blockFilter
      );
    }

    if (this.categoryFilter) {
      tempLocales = tempLocales.filter(local =>
        local.productos?.some(producto => producto.categoria?.nombre_categoria === this.categoryFilter)
      );
    }

    this.sortLocales(tempLocales);
    this.filteredLocales = tempLocales; // filteredLocales es lo que se renderiza en la vista
  }

  sortLocales(locales: LocalConBloque[]): void {
    locales.sort((a, b) => {
      const nameA = a.nombre_del_negocio.toLowerCase();
      const nameB = b.nombre_del_negocio.toLowerCase();

      if (this.sortBy === 'nombre_asc') {
        return nameA.localeCompare(nameB);
      } else if (this.sortBy === 'nombre_desc') {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });
  }

  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;
    this.searchSubject.next(this.searchTerm);
  }

  onBlockFilterChange(): void {
    this.applyFiltersAndSort();
  }

  onCategoryFilterChange(): void {
    this.applyFiltersAndSort();
  }

  onSortByChange(): void {
    this.applyFiltersAndSort();
  }

  getPlaceholderImage(local: Local): string {
    return local.imagen_urls && local.imagen_urls.length > 0
      ? local.imagen_urls[0]
      : 'https://placehold.co/400x200/ADD8E6/000000?text=Local';
  }

  goToLocalDetail(localId: number): void {
    this.router.navigate(['/detalle-local', localId]);
  }

  /**
   * Alterna la expansión/colapso de la descripción de un local.
   * @param local El objeto LocalConBloque cuya descripción se va a alternar.
   */
  toggleDescription(local: LocalConBloque): void {
    local.isExpanded = !local.isExpanded;
  }
}
