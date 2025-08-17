import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css',

  ]
})
export class SidebarComponent {
  // Input para recibir la página activa del componente padre
  @Input() activePage: string = '';

  // Output para emitir un evento cuando se hace clic en una opción del menú
  @Output() pageSelected = new EventEmitter<string>();

  // Propiedad para controlar el estado del menú en móviles
  menuOpen: boolean = false;

  constructor() { }

  /**
   * Navega a la página seleccionada.
   * Emite un evento al componente padre con el nombre de la página.
   * @param page El nombre de la página a la que se va a navegar.
   */
  irAPagina(page: string): void {
    // Emite el evento con el nombre de la página
    this.pageSelected.emit(page);
    // Cierra el menú en vista de móvil después de la selección
    this.menuOpen = false;
  }

  /**
   * Alterna la visibilidad del menú en vistas móviles.
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}