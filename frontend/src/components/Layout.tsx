import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CosmicCursor from './CosmicCursor';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      <CosmicCursor />

      <div className="grain-overlay" />

      <div className="relative z-20">
        <Navbar />

        <main className="pt-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;