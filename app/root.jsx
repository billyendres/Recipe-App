import {
  Links,
  NavLink,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css?url";
import {
  DiscoverIcon,
  HomeIcon,
  RecipeBookIcon,
  SettingsIcon,
} from "./components/icons/icons.jsx";
import classNames from "classnames";

export const meta = () => {
  return [
    { title: "Remix Template" },
    { name: "description", content: "Remix Template" },
  ];
};

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <nav className="bg-primary-dark text-white">
        <ul className="flex flex-col">
          <AppNavLink to="/">
            <HomeIcon />
          </AppNavLink>

          <AppNavLink to="discover">
            <DiscoverIcon />
          </AppNavLink>

          <AppNavLink to="app">
            <RecipeBookIcon />
          </AppNavLink>

          <AppNavLink to="settings">
            <SettingsIcon />
          </AppNavLink>
        </ul>
      </nav>
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
}

const AppNavLink = ({ children, to }) => {
  return (
    <li className="w-16">
      <NavLink to={to}>
        {({ isActive }) => (
          <div
            className={classNames(
              "py-4 flex justify-center hover:bg-primary-light",
              {
                "bg-primary-light": isActive,
              }
            )}
          >
            {children}
          </div>
        )}
      </NavLink>
    </li>
  );
};
