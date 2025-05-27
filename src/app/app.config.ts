import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { errorInterceptor } from './Core/interceptors/error.interceptor';
import { loadingInterceptor } from './Core/interceptors/loading.interceptor';
import { InitService } from './Core/services/init.service';
import { lastValueFrom } from 'rxjs';
function initializeApp(initService: InitService) {
  return () => {
    return lastValueFrom(initService.init()).then(() => {
      const splash = document.getElementById('initial-splash');
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 500); 
      }
    }).catch(() => {
      const splash = document.getElementById('initial-splash');
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 500);
      }
    });
  };
}



export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor,loadingInterceptor])),{
    provide: APP_INITIALIZER,
    useFactory: initializeApp,
    multi: true,
    deps: [InitService],
    }
  ]
};
