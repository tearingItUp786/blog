import clsx from "clsx";
import { useEffect, useState } from "react";
import { Theme, useTheme } from "~/utils/theme-provider";

const ThemeToggle = () => {
  const [, setTheme] = useTheme();
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  console.log("isFooterVisible", isFooterVisible);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cb: IntersectionObserverCallback = (entries) => {
        if (entries?.[0]?.isIntersecting) {
          setIsFooterVisible(true);
        } else {
          setIsFooterVisible(false);
        }
      };
      const observer = new IntersectionObserver(cb, {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      });

      let footer = document.getElementsByTagName("footer")[0];
      if (footer) {
        observer.observe(footer);
      }

      return () => {
        if (footer) {
          observer.unobserve(footer);
        }
      };
    }
  }, []);

  return (
    <>
      <div
        className={clsx(
          isFooterVisible && "absolute bottom-32 lg:bottom-24",
          "z-100",
          "fixed bottom-4 right-4 h-10 w-[5.5rem] flex items-center rounded-full p-2 cursor-pointer transition-colors bg-[#00000020] dark:bg-[#ffffff20]"
        )}
        onClick={() => {
          setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK));
        }}
      >
        <input
          className={clsx(
            "drop-shadow-toggle transition-transform transition-color ease-in-out appearance-none cursor-pointer h-7 w-7 rounded-full",
            "bg-white translate-x-0",
            "dark:translate-x-[160%] dark:bg-gray-300"
          )}
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
        />
      </div>
    </>
  );
};

export default ThemeToggle;
