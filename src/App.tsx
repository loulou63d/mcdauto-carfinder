import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import SearchPage from "./pages/Search";
import VehicleDetail from "./pages/VehicleDetail";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceFinancing from "./pages/ServiceFinancing";
import ServiceEstimation from "./pages/ServiceEstimation";
import ServiceMaintenance from "./pages/ServiceMaintenance";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import CGV from "./pages/CGV";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Evaluation from "./pages/Evaluation";
import Sell from "./pages/Sell";
import Repair from "./pages/Repair";
import FAQ from "./pages/FAQ";
import Warranty from "./pages/Warranty";
import Delivery from "./pages/Delivery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/de" replace />} />
          <Route path="/:lang" element={<Layout />}>
             <Route index element={<Index />} />
             <Route path="search" element={<SearchPage />} />
             <Route path="vehicle/:id" element={<VehicleDetail />} />
             <Route path="about" element={<About />} />
             <Route path="services" element={<Services />} />
             <Route path="services/financing" element={<ServiceFinancing />} />
             <Route path="services/estimation" element={<ServiceEstimation />} />
             <Route path="services/maintenance" element={<ServiceMaintenance />} />
             <Route path="evaluation" element={<Evaluation />} />
             <Route path="sell" element={<Sell />} />
             <Route path="repair" element={<Repair />} />
             <Route path="warranty" element={<Warranty />} />
             <Route path="delivery" element={<Delivery />} />
             <Route path="faq" element={<FAQ />} />
             <Route path="contact" element={<Contact />} />
             <Route path="legal" element={<Legal />} />
             <Route path="privacy" element={<Privacy />} />
             <Route path="cgv" element={<CGV />} />
           </Route>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
