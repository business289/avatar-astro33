import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BackButton from './BackButton';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      <div className="grain-overlay" />

      <div className="relative z-20">
        <Navbar />
        <BackButton />

        <main className="pt-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;