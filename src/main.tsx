import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Register service worker with instant background auto-update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // 1. Check for service worker updates immediately on page load
      registration.update();

      // 2. Whenever an update is found and installed, activate it immediately
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available; tell worker to skipWaiting
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(() => {
      // Service worker registration failed - app still works offline/online
    });

    // 3. When new service worker takes control, reload to show latest code seamlessly
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // 4. When app comes back to foreground (e.g. unlocking phone or switching back to home screen icon)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) registration.update();
        });
      }
    });
  });
}
