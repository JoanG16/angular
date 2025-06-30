import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como ngIf, ngFor si las usas
import { Router } from '@angular/router';


@Component({
  selector: 'app-inicio',
  standalone: true, // Importante si tu proyecto es standalone
  imports: [
    CommonModule // Incluir CommonModule
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  // Puedes poner el nombre del usuario aquí si lo tienes de alguna parte,
  // por ahora es un placeholder.
  nombreUsuario: string = 'Nombre de Usuario';

  constructor(private route: Router) { }

  ngOnInit(): void {
    // No necesitamos lógica compleja aquí para esta vista.
  }

  // Si quisieras que los botones tuvieran una acción de ir a una ruta,
  // lo harías con RouterLink en el HTML y podrías inyectar Router aquí.
  irAPagina(titulo: string): void {
    this.route.navigate([titulo])

  }
}
