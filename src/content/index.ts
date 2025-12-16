console.log("[PWA Scope Fixer] Content script loaded.");

let deferredPrompt: any = null;

window.addEventListener("beforeinstallprompt", (e: any) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  deferredPrompt = e;
  console.log("[PWA Scope Fixer] Captured beforeinstallprompt");
});

function getPwaDefaults() {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const themeColor = themeColorMeta ? themeColorMeta.getAttribute("content") : null;

  const bodyStyles = window.getComputedStyle(document.body);
  const backgroundColor =
    bodyStyles.backgroundColor !== "rgba(0, 0, 0, 0)" &&
    bodyStyles.backgroundColor !== "transparent"
      ? bodyStyles.backgroundColor
      : "#ffffff";

  return {
    name: document.title || "Fixed PWA",
    short_name: document.title || "Fixed PWA",
    background_color: backgroundColor,
    theme_color: themeColor,
  };
}

function injectManifest(settings: {
  startUrl: string;
  name?: string;
  shortName?: string;
  backgroundColor?: string;
  themeColor?: string;
}) {
  console.log("[PWA Scope Fixer] Injecting manifest with settings:", settings);

  // 1. Create Policy for TrustedTypes (if required by the site)
  let policy: any = { createHTML: (s: string) => s };
  if ((window as any).trustedTypes && (window as any).trustedTypes.createPolicy) {
    try {
      policy = (window as any).trustedTypes.createPolicy("pwa-scope-fixer", {
        createHTML: (html: string) => html,
      });
    } catch (e) {
      console.warn("[PWA Scope Fixer] Policy creation failed (likely exists):", e);
    }
  }

  // 2. Remove existing manifest to avoid conflict
  const existingLinks = document.querySelectorAll('link[rel="manifest"]');
  existingLinks.forEach((link) => link.remove());

  // Find existing icons
  const iconLinks = Array.from(
    document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
    ),
  );

  const manifestIcons = iconLinks
    .map((link: any) => {
      const sizes = link.getAttribute("sizes");
      const type = link.getAttribute("type") || "image/png";
      return {
        src: link.href,
        sizes: sizes || "192x192", // Fallback size if not specified
        type: type,
      };
    })
    .filter((icon) => icon.src); // Ensure src exists

  // Fallback to generated icon if no icons found
  if (manifestIcons.length === 0) {
    console.log("[PWA Scope Fixer] No icons found, using fallback icon");
    const fallbackIconUrl = (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 192;
      canvas.height = 192;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#3383db";
        ctx.fillRect(0, 0, 192, 192);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 80px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PWA", 96, 96);
      }
      return canvas.toDataURL("image/png");
    })();

    manifestIcons.push(
      {
        src: fallbackIconUrl,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: fallbackIconUrl,
        sizes: "512x512",
        type: "image/png",
      },
    );
  }

  // 3. Construct Manifest
  const defaults = getPwaDefaults();

  // Using a generic manifest that encourages standalone mode
  const manifestJson: any = {
    start_url: settings.startUrl,
    display: "standalone",
    name: settings.name || defaults.name,
    short_name: settings.shortName || defaults.short_name,
    background_color: settings.backgroundColor || defaults.background_color,
    icons: manifestIcons,
  };

  const themeColor = settings.themeColor || defaults.theme_color;
  if (themeColor) {
    manifestJson.theme_color = themeColor;
  }

  const manifestString = JSON.stringify(manifestJson);
  // Using Data URI for manifest
  const dataUri = `data:application/manifest+json,${encodeURIComponent(manifestString)}`;

  // 4. Inject
  const linkString = `<link rel="manifest" href='${dataUri}' />`;

  try {
    const head = document.head || document.documentElement;
    // Insert as first child to prioritize
    head.insertAdjacentHTML("afterbegin", policy.createHTML(linkString));
    console.log("[PWA Scope Fixer] Injection Complete");
  } catch (e) {
    console.error("[PWA Scope Fixer] Injection Failed:", e);
  }
}

function showInstallErrorModal() {
  const modalId = "pwa-scope-fixer-modal";
  if (document.getElementById(modalId)) return;

  const modal = document.createElement("div");
  modal.id = modalId;
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1);
    z-index: 10000;
    max-width: 400px;
    font-family: system-ui, -apple-system, sans-serif;
    text-align: center;
    color: #333;
  `;

  const title = document.createElement("h3");
  title.innerText = "PWA Install Prompt Not Ready";
  title.style.marginTop = "0";
  title.style.marginBottom = "10px";

  const message = document.createElement("p");
  message.innerText =
    "If you just applied the fix, please REFRESH the page to enable installation.\n\nIf installation fails, try deleting existing apps in chrome://apps/ (copy and paste into address bar)";
  message.style.marginBottom = "20px";
  message.style.lineHeight = "1.5";
  message.style.whiteSpace = "pre-wrap";
  message.style.userSelect = "text"; // Allow text selection

  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.justifyContent = "center";
  btnContainer.style.gap = "10px";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Close";
  closeBtn.style.padding = "8px 16px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.border = "1px solid #ccc";
  closeBtn.style.borderRadius = "4px";
  closeBtn.style.backgroundColor = "#fff";
  closeBtn.onclick = () => modal.remove();

  btnContainer.appendChild(closeBtn);

  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(btnContainer);

  document.body.appendChild(modal);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fix_scope") {
    // request should contain startUrl, name, shortName, etc.
    injectManifest(request.settings);
    sendResponse({ success: true });
  } else if (request.action === "trigger_install") {
    console.log("[PWA Scope Fixer] Received trigger_install message");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("[PWA Scope Fixer] User accepted the A2HS prompt");
        } else {
          console.log("[PWA Scope Fixer] User dismissed the A2HS prompt");
        }
        deferredPrompt = null;
      });
    } else {
      showInstallErrorModal();
    }
  } else if (request.action === "check_install_status") {
    sendResponse({ ready: !!deferredPrompt });
  } else if (request.action === "get_manifest_defaults") {
    sendResponse(getPwaDefaults());
  }
});
