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
import { LoginComponent } from './components/administrador/login/login.component'; // Asegúrate de que esta ruta sea correcta
import {LocalComponent} from './components/page/locales/locales.component'
import { SobreNosotrosComponent } from './components/page/sobre-nosotros/sobre-nosotros.component';
import { GestionUsuariosComponent } from './components/administrador/gestion-usuarios/gestion-usuarios.component';
import { ResetPasswordComponent } from './components/administrador/reset-password/reset-password.component';
import { ComerciantesComponent } from './components/administrador/comerciantes/comerciantes.component';
import { ForgotPasswordComponent } from './components/administrador/forgot-password/forgot-password.component';// ¡NUEVO COMPONENTE!

// Importar el guardia de autenticación
import { authGuardFn } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas (accesibles sin autenticación)
  { path: '', component: HomeComponent },
  { path: 'mapa_contenedores', component: MapaContenedoresComponent },
  { path: 'detalle-local/:id', component: DetalleLocalComponent }, // Ruta de detalle de local
  { path: 'login', component: LoginComponent },
{path: 'local', component: LocalComponent},
{path: 'sobre-nosotros', component: SobreNosotrosComponent},
{path: 'gestion-usuarios', component: GestionUsuariosComponent},
{path: 'reset-password/token/:token', component: ResetPasswordComponent},
{path: 'forgot-password', component: ForgotPasswordComponent},
  // Rutas protegidas (requieren autenticación)
  // Utiliza `canActivate` con el guardia de autenticación para estas rutas
  { path: 'plano_contenedores', component: PlanoCoordenadasComponent, canActivate: [authGuardFn] },
  { path: 'locales', component: LocalesComponent, canActivate: [authGuardFn] },
  { path: 'socios', component: SociosComponent, canActivate: [authGuardFn] },
  { path: 'inicio', component: InicioComponent, canActivate: [authGuardFn] },
  { path: 'producto', component: ProductoCrudComponent, canActivate: [authGuardFn] },
  { path: 'oferta', component: OfertasComponent, canActivate: [authGuardFn] },
{
    path: 'comerciantes/dashboard/:id',
    component: ComerciantesComponent,
    canActivate: [authGuardFn]
  },

  // Ruta comodín para cualquier otra ruta no definida
  // Redirige a la página de inicio. Puedes cambiarlo a '/login' si prefieres.
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
