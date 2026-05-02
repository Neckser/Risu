import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TuiAlertService, provideTaiga } from '@taiga-ui/core';
import { TuiToastService } from '@taiga-ui/kit';
import { provideEventPlugins } from '@taiga-ui/event-plugins';

import { routes } from './app.routes';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { errorInterceptor } from '@core/api/error.interceptor';
import { mockApiInterceptor } from '@core/api/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor, mockApiInterceptor])),
    provideTaiga({
      scrollbars: 'custom',
      apis: 'stable',
    }),
    provideEventPlugins(),
    { provide: TuiAlertService, useExisting: TuiToastService },
  ],
};
