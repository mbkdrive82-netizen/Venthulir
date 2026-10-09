'use client';

import React, { useState, useEffect, createContext, useContext, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import VisitorLeadModal from '@/components/VisitorLeadModal';
import NavigationProgressBar from '@/components/NavigationProgressBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UIModalContext = createContext();
export const useUIModal = () => useContext(UIModalContext);

function ProvidersInner({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const { setIsCartOpen, isCartOpen } = useCart();

  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isProfileRoute = pathname?.startsWith('/profile') || pathname?.startsWith('/account');

  const router = useRouter();
  const lenisRef = React.useRef(null);

  useEffect(() => {
    // Disable smooth scrolling in Admin dashboard to prevent scroll hijacking bugs
    if (isAdminRoute || typeof window === 'undefined') return;

    let lenisInstance = null;
    let animationFrameId = null;

    import('lenis').then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
      });

      lenisRef.current = lenisInstance;

      function raf(time) {
        lenisInstance.raf(time);
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);
    }).catch((err) => {
      console.warn('Lenis smooth scroll initialization skipped:', err?.message);
    });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisRef.current = null;
      }
    };
  }, [isAdminRoute]);

  // Instant Scroll to Top on every route change (prevents landing at footer)
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  // Pause Lenis smooth scrolling when drawers or modals are open to allow full native scrolling inside them
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isCartOpen || authOpen || Boolean(checkoutData)) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isCartOpen, authOpen, checkoutData]);

  const openCheckout = (cartSummary) => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const hideFooter = isAdminRoute || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/register') || 
    pathname?.startsWith('/profile') || 
    pathname?.startsWith('/checkout') || 
    pathname?.startsWith('/account');

  const handleOpenAuth = () => {
    setAuthOpen(true);
  };

  return (
    <UIModalContext.Provider value={{ setAuthOpen: () => setAuthOpen(true), openCheckout: (summary) => { setIsCartOpen(false); setCheckoutData(summary); } }}>
      <Suspense fallback={null}>
        <NavigationProgressBar />
      </Suspense>

      {!isAdminRoute && (
        <Navbar
          onAuthOpen={handleOpenAuth}
        />
      )}

      {!isAdminRoute && <CartDrawer onCheckout={openCheckout} />}

      <main>{children}</main>

      {!hideFooter && <Footer />}

      {!isAdminRoute && <FloatingWhatsApp />}

      {!isAdminRoute && <VisitorLeadModal />}

      {authOpen && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
        />
      )}

      {checkoutData && (
        <CheckoutModal
          cartSummary={checkoutData}
          onClose={() => setCheckoutData(null)}
          onAuthOpen={() => {
            setCheckoutData(null);
            handleOpenAuth();
          }}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </UIModalContext.Provider>
  );
}

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <ProvidersInner>{children}</ProvidersInner>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
