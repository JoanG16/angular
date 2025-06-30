import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  // este es el componente que está relacionado en el index.html principal
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // propiedad de la clase
  title = 'angular';
}
