import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
      setIsVisible(true);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;

    installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsVisible(false);
    }
  }

  function dismissPrompt() {
    setIsVisible(false);
  }

  if (!isVisible || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 z-[300] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/30">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Download size={18} className="text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Install PennyPlot
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Add PennyPlot to your device for a faster,
            app-like experience.
          </p>

          <button
            type="button"
            onClick={installApp}
            className="mt-3 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Install app
          </button>
        </div>

        <button
          type="button"
          onClick={dismissPrompt}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;