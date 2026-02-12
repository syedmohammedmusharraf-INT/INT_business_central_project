import { ReactNode } from "react";
import LeftNavigation from "./LeftNavigation";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftNavigation />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
