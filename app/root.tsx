import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { MetaFunction } from "remix";
import clsx from "clsx";
import appStyles from "./styles/app.css";

import tailwindStyles from "./styles/tailwind.css";
import prismaStyles from "./styles/prisma-theme.css";
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from "./utils/theme-provider";
import Toggle from "~/components/theme-toggle";
import { Navbar } from "./components/navbar";

export const meta: MetaFunction = () => {
  return { title: `Taran "tearing it up" Bains` };
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStyles },
    { rel: "icon", href: "/favicon.ico" },
    { rel: "stylesheet", href: appStyles },
    { rel: "stylesheet", href: prismaStyles },
  ];
};

const App = () => {
  const [theme] = useTheme();
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body className="bg-white dark:bg-gray-100">
        <Navbar />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Toggle />
      </body>
    </html>
  );
};

export default function AppWithProviders() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
