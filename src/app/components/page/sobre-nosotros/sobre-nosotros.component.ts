// src/app/components/page/sobre-nosotros/sobre-nosotros.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como ngIf, ngFor
import { RouterLink } from '@angular/router'; // Para la navegación en el header

@Component({
  selector: 'app-sobre-nosotros',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink // Asegúrate de que RouterLink esté importado para el header
  ],
  templateUrl: './sobre-nosotros.component.html',
  styleUrls: ['./sobre-nosotros.component.css']
})
export class SobreNosotrosComponent implements OnInit {
  currentYear: number = new Date().getFullYear(); // Para mostrar el año actual si es necesario

  constructor() { }

  ngOnInit(): void {
    // No se necesita lógica compleja para este componente estático
  }
}
