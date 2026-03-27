import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import CTA from "./CTA";
import Features from "./Features";
import Footer from "./Footer";
import Hero from "./Hero";
import MobileApp from "./MobileApp";
import Navbar from "./Navbar";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import WhyTRIMEDH from "./WhyTRIMEDH";
import { X } from "lucide-react";

function Index() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Navbar openDemoModal={() => setIsDemoModalOpen(true)} />
      <Hero openDemoModal={() => setIsDemoModalOpen(true)} />
      <WhyTRIMEDH />
      <Features />
      <CTA openDemoModal={() => setIsDemoModalOpen(true)} />
      <Pricing />
      <MobileApp />
      <Testimonials />
      <Footer />

      {/* Demo Video Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
            onClick={() => setIsDemoModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10" data-aos="zoom-in" data-aos-duration="300">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsDemoModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Aspect ratio container for 16:9 video */}
            <div className="relative pt-[56.25%] w-full bg-slate-900">
              <div className="absolute inset-0 flex items-center justify-center">
                 <iframe 
                   className="w-full h-full"
                   src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                   title="TRIMEDH Demo" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
