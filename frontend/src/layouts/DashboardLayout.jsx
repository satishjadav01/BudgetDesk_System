import { Outlet } from "react-router-dom";

import { Navbar } from "../components/common/Navbar";
import { Sidebar } from "../components/common/Sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-6 xl:gap-8">
        <Sidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <Navbar />
          <div className="pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
