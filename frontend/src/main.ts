// Polyfill for Node.js globals
declare global {
  interface Window {
    global: Window;
    process: {
      env: { [key: string]: string };
      browser: boolean;
    };
  }
}

(window as any).global = window;
(window as any).process = {
  env: {},
  browser: true
};

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
