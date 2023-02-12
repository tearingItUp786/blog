import { NavLink } from "@remix-run/react";
import clsx from "clsx";
import { Logo } from "./logo";

export function Navbar() {
  const navClassName =
    "transition-[color] duration-300 flex justify-center pt-[5px] hover:!text-pink focus:!text-pink text-white block min-w-[150px] text-center dark:text-gray-300 text-xl italic font-light items-center";
  const activeClassName =
    "!text-pink font-display not-italic font-bold bg-white dark:bg-gray-100";
  const setNavClassName = ({ isActive }: { isActive: boolean }) => {
    return clsx(navClassName, isActive && activeClassName);
  };

  return (
    <div className="w-full flex justify-between bg-gray-100 dark:bg-white">
      <div className="w-[80px]">
        <NavLink to="/">
          <Logo className="logoNavLink px-4 py-1" />
        </NavLink>
      </div>
      <div className="flex justify-center">
        <NavLink className={setNavClassName} to="/til">
          TIL
        </NavLink>
        <NavLink className={setNavClassName} to="/blog">
          BLOG
        </NavLink>
        <NavLink className={setNavClassName} to="/about">
          ABOUT
        </NavLink>
      </div>
      <div>Search</div>
    </div>
  );
}
