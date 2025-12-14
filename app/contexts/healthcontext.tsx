"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface HealthContextType {
  isHealthy: boolean;
  isChecking: boolean;
  checkHealth: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'https://abc.molyb.xyz'}/health`,
        {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        }
      );

      clearTimeout(timeoutId);
      
      if (response.ok) {
        setIsHealthy(true);
      } else {
        setIsHealthy(false);
        if (pathname !== "/offline") {
          router.push("/offline");
        }
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsHealthy(false);
      if (pathname !== "/offline") {
        router.push("/offline");
      }
    } finally {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Check health every 30 seconds
  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up interval
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <HealthContext.Provider value={{ isHealthy, isChecking, checkHealth }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
}