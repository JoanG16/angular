import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como ngIf, ngFor si las usas
import { Router, RouterLink } from '@angular/router'; // Importa RouterLink aquí
import { AuthService } from '../../../services/administrador/auth.service'; // Importa el servicio de autenticación

@Component({
  selector: 'app-inicio',
  standalone: true, // Importante si tu proyecto es standalone
  imports: [
    CommonModule, // Incluir CommonModule
    RouterLink // Asegúrate de que RouterLink esté importado si lo usas en el HTML
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  nombreUsuario: string = 'Usuario'; // Valor por defecto
  isDropdownOpen: boolean = false; // Controla la visibilidad del menú desplegable

  constructor(
    private router: Router, // Renombrado de 'route' a 'router' para mayor claridad y consistencia
    private authService: AuthService // Inyecta el servicio de autenticación
  ) { }

  ngOnInit(): void {
    // Obtener el nombre del usuario al inicializar el componente
    const userName = this.authService.getUsername();
    if (userName) {
      this.nombreUsuario = userName;
    } else {
      // Si no hay usuario logeado, redirigir a login (o manejar según la lógica de tu app)
      this.router.navigate(['/login']);
    }
  }

  /**
   * Navega a una página específica.
   * @param path La ruta a la que navegar.
   */
  irAPagina(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Alterna la visibilidad del menú desplegable del usuario.
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Dropdown toggled. isDropdownOpen:', this.isDropdownOpen); // LOG DE DEPURACIÓN
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    this.authService.logout();
    this.isDropdownOpen = false; // Cierra el dropdown después de cerrar sesión
  }
}
