"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This will run on every route change
    NProgress.done();
    
    return () => {
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return null;
}
