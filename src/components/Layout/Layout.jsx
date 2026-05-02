import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
      ></div>
      <Sidebar open={sidebarOpen} />
      <div className="main-wrapper">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
