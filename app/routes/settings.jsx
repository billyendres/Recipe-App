import { Link, Outlet } from "@remix-run/react";

const Settings = () => {
  return (
    <div>
      <h1>Settings</h1>
      <p>Settings page</p>
      <nav>
        <Link to="app">App</Link>
        <Link to="profile">Profile</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default Settings;
