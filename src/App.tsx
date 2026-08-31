/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { DashboardPage } from './pages/DashboardPage';
import { IndiaMapPage } from './pages/IndiaMapPage';
import { RoutesPage } from './pages/RoutesPage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SiteHeader } from './components/navigation/SiteHeader';
import { ScrollToTop } from './components/navigation/ScrollToTop';
import { ThemeProvider } from './context/ThemeContext';

import { ErrorBoundary } from './components/common/ErrorBoundary';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/home';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200">
      {/* On non-landing pages, render the universal SiteHeader */}
      {!isLanding && <SiteHeader />}
      <ErrorBoundary fallbackTitle="Application View Interrupted">
        {children}
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Landing />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<IndiaMapPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/:slug" element={<RouteDetailPage />} />
            <Route path="/anomalies" element={<AnomaliesPage />} />
            <Route path="/data" element={<DataExplorerPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </ThemeProvider>
  );
}
