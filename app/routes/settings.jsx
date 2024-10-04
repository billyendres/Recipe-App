import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

export const loader = () => {
  return json({ message: "hello" });
};

const Settings = () => {
  const data = useLoaderData();
  return (
    <div>
      <h1>Settings</h1>
      <p>Settings page</p>
      <p>Message from loader: {data.message}</p>
      <nav>
        <Link to="app">App</Link>
        <Link to="profile">Profile</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default Settings;
