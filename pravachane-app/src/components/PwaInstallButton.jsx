import React, { useEffect, useState } from 'react';
import '../css/pwa-install.css';

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const inStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = window.navigator.standalone;
    const currentlyInstalled = !!inStandalone || !!iosStandalone;

    if (currentlyInstalled) {
      setIsInstalled(true);
      setVisible(false);
      return;
    }

    function onBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }

    function onAppInstalled() {
      setIsInstalled(true);
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const onInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setVisible(false);
        setIsInstalled(true);
      }
    }
  };

  if (isInstalled || !visible) return null;

  return (
    <div className="install-banner">
      <div className="install-banner__body">
        <div className="install-banner__icon">📱</div>
        <div className="install-banner__copy">
          <strong>प्रवचन संग्रह इन्स्टॉल करा</strong>
          <p>होम स्क्रीनवर जोडा आणि ऑफलाइन वापरा.</p>
        </div>
        <button className="install-banner__cta" onClick={onInstallClick}>
          इन्स्टॉल करा
        </button>
      </div>
    </div>
  );
}
