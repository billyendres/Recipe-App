import {
  Links,
  NavLink,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  useResolvedPath,
  useRouteError,
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
      <body className="md:flex md:h-screen">
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
        <ul className="flex md:flex-col">
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
      <div className="p-4 w-full">
        <Outlet />
      </div>
    </>
  );
}

const AppNavLink = ({ children, to }) => {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.pathname === path.pathname;
  return (
    <li className="w-16">
      <NavLink to={to}>
        {({ isActive }) => (
          <div
            className={classNames(
              "py-4 flex justify-center hover:bg-primary-light",
              isActive ? "bg-primary-light" : "",
              isLoading ? "animate-pulse bg-primary-light" : ""
            )}
          >
            {children}
          </div>
        )}
      </NavLink>
    </li>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  console.error("Caught global error:", error);

  // Show detailed error message in development and a generic one in production
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="bg-red-300 border-2 border-red-600 rounded p-4 m-4">
        <h1>Whoops, something went wrong (Development)!</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return (
      <div className="bg-red-300 border-2 border-red-600 rounded p-4 m-4">
        <h1>Whoops, something went wrong!</h1>
        <p>
          We're sorry, but we encountered an unexpected issue. Please try again
          later.
        </p>
      </div>
    );
  }
}
