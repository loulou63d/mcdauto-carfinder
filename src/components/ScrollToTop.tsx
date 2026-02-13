import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const prevPathname = useRef(pathname);

  // Save scroll position before unload (refresh)
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem("scrollY", String(window.scrollY));
      sessionStorage.setItem("scrollPath", pathname);
    };
    window.addEventListener("beforeunload", saveScroll);
    return () => window.removeEventListener("beforeunload", saveScroll);
  }, [pathname]);

  // Restore scroll on mount (refresh) or scroll to top on navigation
  useEffect(() => {
    const savedPath = sessionStorage.getItem("scrollPath");
    const savedY = sessionStorage.getItem("scrollY");

    if (savedPath === pathname && savedY !== null) {
      // Page refresh — restore position
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(savedY, 10), left: 0, behavior: "instant" });
      });
      sessionStorage.removeItem("scrollY");
      sessionStorage.removeItem("scrollPath");
    } else if (prevPathname.current !== pathname) {
      // New page navigation — scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    prevPathname.current = pathname;
  }, [pathname]);

  return null;
};

export default ScrollToTop;
