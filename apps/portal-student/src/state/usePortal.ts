import { useContext } from "react";

import { PortalContext, type PortalContextValue } from "./PortalContextObject";

export function usePortal(): PortalContextValue {
  const context = useContext(PortalContext);

  if (!context) {
    throw new Error("usePortal must be used within PortalProvider.");
  }

  return context;
}
