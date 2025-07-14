// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0' // Esto permite que el servidor escuche en todas las interfaces de red disponibles
    // lo que soluciona el problema de "host no permitido" para túneles como Tunnelmole.
  }
});