// import Hero from "./Hero";
import CTA from "./CTA";
import Features from "./Features";
import Footer from "./Footer";
import Hero from "./Hero";
import MobileApp from "./MobileApp";
import Navbar from "./Navbar";
import Pricing from "./Pricing";
// import Stats from "./Stats";
import Testimonials from "./Testimonials";
import WhyTrimed from "./WhyTrimed";
// import FAQ from "./FAQ";
// import Navbar from "./Navbar";
// import WhyTrimed from "./WhyTrimed";

function Index() {
  return (
    <>
    <Navbar />
   <Hero />
   {/* <Stats /> */}
   <WhyTrimed/>
   <Features/>
   <CTA />
   <Pricing/>
   <MobileApp/>
   <Testimonials />
   {/* <FAQ /> */}
   <Footer />


   
   
    {/* 
    <WhyTrimed />
    <Features />
    */}
    </>
    );
}

export default Index;