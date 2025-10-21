import React from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Suspense } from "react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Suspense>
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 md:p-8 bg-muted/30">{children}</main>
        </div>
      </Suspense>
    </div>
  );
}
