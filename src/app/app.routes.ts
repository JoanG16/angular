import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './components/page/home/home.component';
import { MapaContenedoresComponent } from './components/page/mapa-contenedores/mapa-contenedores.component';
import { PlanoCoordenadasComponent } from './components/administrador/plano-coordenadas/plano-coordenadas.component';
import { LocalesComponent } from './components/administrador/locales/locales.component';
import { SociosComponent } from './components/administrador/socios/socios.component';
import { InicioComponent } from './components/administrador/inicio/inicio.component';
import { OfertasComponent } from './components/administrador/ofertas/ofertas.component';
import { DetalleLocalComponent } from './components/page/detalle-local/detalle-local.component';
import { ProductoCrudComponent } from './components/administrador/producto-crud/producto-crud/producto-crud.component';

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'mapa_contenedores', component: MapaContenedoresComponent },
  { path: 'plano_contenedores', component: PlanoCoordenadasComponent },
  { path: 'locales', component: LocalesComponent },
  { path: 'socios', component: SociosComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'producto', component: ProductoCrudComponent },
  { path: 'oferta', component:OfertasComponent },
  {path: 'detalle/:id', component:DetalleLocalComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }