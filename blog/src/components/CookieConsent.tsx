import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem("cookieConsent");
    if (!consentGiven && !isOpen) {
      setIsOpen(true);
    }
  }, [isOpen]);

  const handleConsent = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setIsOpen(false);
  };
  return (
    <div>
      <button className="hover:text-skin-accent" onClick={() => setIsOpen(true)}>Cookie Settings</button>
      {isOpen && (
      <div className="fixed bottom-0 left-0 z-50 flex max-w-2xl flex-col items-start bg-skin-card-muted bg-opacity-80 p-4 sm:bottom-4 sm:left-4 sm:w-auto sm:rounded-lg">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-2 top-2 cursor-pointer border-none bg-transparent text-xl text-skin-base hover:text-skin-accent"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="mb-2 text-xl font-semibold text-skin-base">Cookie Settings</h2>
        <p className="m-0">
          We use cookies to help improve our website and understand how you
          interact with our content. This includes cookies for Google Analytics,
          which collect anonymous data (such as page views and visit duration)
          to improve user experience.
        </p>
        <p>
          Please note that while you can manage and
          disable cookies for Google Analytics through your browser settings,
          some essential cookies set by our hosting provider for performance and
          security purposes cannot be disabled.
        </p>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={handleDecline}
            className="cursor-pointer rounded border-none bg-skin-inverted/70 px-4 py-2 text-skin-inverted hover:bg-skin-inverted/80"
          >
            Decline
          </button>
          <button
            onClick={handleConsent}
            className="cursor-pointer rounded border-none bg-skin-inverted/70 px-4 py-2 text-skin-inverted hover:bg-skin-inverted/80"
          >
            Accept
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
