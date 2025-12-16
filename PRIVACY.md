# Privacy Policy

**Last Updated:** December 16, 2024

**PWA Scope Fixer** ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our Chrome Extension operates and handles your data.

## 1. Data Collection and Usage

**We do not collect, store, share, or transmit any of your personal data.**

The **PWA Scope Fixer** extension operates entirely locally on your device.
- All settings (such as custom Start URLs, App Names, and Colors) are stored locally in your browser using the `chrome.storage.local` API.
- No data is ever sent to external servers or third-party services.
- We do not use any analytics or tracking software.

## 2. Permissions

The extension requires the following permissions to function:

- **activeTab**: Used only when you click the extension icon to read the current page's URL and title, allowing us to pre-fill the PWA settings for you.
- **scripting**: Used to inject the Web Manifest code (`<link rel="manifest">`) into the webpage you are viewing. This is necessary to modify the PWA scope and behavior as requested by you.
- **storage**: Used to save your PWA preferences for specific websites locally on your device, so they can be re-applied when you visit the site again.
- **tabs** (Optional): Used to manage browser tabs for extension functionality.

## 3. Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## 4. Contact Us

If you have any questions about this Privacy Policy, please contact us at:

- **GitHub Issues:** [https://github.com/kittizz/pwa-scope-fixer/issues](https://github.com/kittizz/pwa-scope-fixer/issues)
