import React from "react";
import CTA from "./CTA";
import Features from "./Features";
import Footer from "./Footer";
import Hero from "./Hero";
import MobileApp from "./MobileApp";
import Navbar from "./Navbar";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import WhyTRIMEDH from "./WhyTRIMEDH";

function Index() {
  console.log("Index: Landing page rendering");
  return (
    <>
      <Navbar />
      <Hero />
      <WhyTRIMEDH />
      <Features />
      <CTA />
      <Pricing />
      <MobileApp />
      <Testimonials />
      <Footer />
    </>
  );
}

export default Index;
