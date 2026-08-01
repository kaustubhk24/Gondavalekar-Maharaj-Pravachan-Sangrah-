/**
 * Swizzled copy of the Docusaurus PWA reload popup component.
 * This ensures the plugin can resolve @theme/PwaReloadPopup during build.
 */
import React, { useState } from 'react';
import clsx from 'clsx';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function PwaReloadPopup({ onReload }) {
  const [isVisible, setIsVisible] = useState(true);
  return (
    isVisible && (
      <div className={clsx('alert', 'alert--secondary', styles.popup)}>
        <p>
          <Translate
            id="theme.PwaReloadPopup.info"
            description="The text for PWA reload popup"
          >
            {({ locale }) => locale === 'hi' ? 'नया संस्करण उपलब्ध है' : 'New version available'}
          </Translate>
        </p>
        <div className={styles.buttonContainer}>
          <button
            className="button button--link"
            type="button"
            onClick={() => {
              setIsVisible(false);
              onReload();
            }}
          >
            <Translate
              id="theme.PwaReloadPopup.refreshButtonText"
              description="The text for PWA reload button"
            >
              {({ locale }) => locale === 'hi' ? 'रिफ्रेश' : 'Refresh'}
            </Translate>
          </button>

          <button
            aria-label={translate({
              id: 'theme.PwaReloadPopup.closeButtonAriaLabel',
              message: 'Close',
              description:
                'The ARIA label for close button of PWA reload popup',
            })}
            className="close"
            type="button"
            onClick={() => setIsVisible(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    )
  );
}
