import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
// `provideAnimationsAsync` is deprecated in Angular 21 in favour of declarative
// `animate.enter`/`animate.leave`. We keep it because Taiga UI libraries still
// rely on the imperative animation engine; they will be migrated by upstream.
// eslint-disable-next-line @typescript-eslint/no-deprecated
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
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor, mockApiInterceptor])),
    provideTaiga({
      scrollbars: 'custom',
      apis: 'stable',
    }),
    provideEventPlugins(),
    // TuiAlertService is abstract; Taiga 5 provides TuiToastService (kit) as the
    // concrete implementation. Alias the abstract token so consumers can inject
    // TuiAlertService (e.g. error.interceptor) without depending on kit directly.
    { provide: TuiAlertService, useExisting: TuiToastService },
  ],
};
