"use client";

import React, { useState, useEffect, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
}

/**
 * A wrapper component that ensures its children are only rendered on the client-side.
 * This is useful for preventing hydration mismatches with components that rely on
 * browser-specific APIs or state (e.g., localStorage for themes).
 */
export default function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
