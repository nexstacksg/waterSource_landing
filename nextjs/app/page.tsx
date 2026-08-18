import AiPreventive from "@/components/AiPreventive";
import AiWhy from "@/components/AiWhy";
import Consultation from "@/components/Consultation";
import CoreSystems from "@/components/CoreSystems";
import EarlyDetection from "@/components/EarlyDetection";
import ExperienceCta from "@/components/ExperienceCta";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Founder from "@/components/Founder";
import FunctionalWater from "@/components/FunctionalWater";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HiddenProblem from "@/components/HiddenProblem";
import Method from "@/components/Method";
import MobileCta from "@/components/MobileCta";
import Products from "@/components/Products";
import Programs from "@/components/Programs";
import Proof from "@/components/Proof";
import Properties from "@/components/Properties";
import RealQuestion from "@/components/RealQuestion";
import Reviews from "@/components/Reviews";
import SiteInteractions from "@/components/SiteInteractions";
import StickySubnav from "@/components/StickySubnav";
import Testimonials from "@/components/Testimonials";
import Topbar from "@/components/Topbar";
import TruthOffer from "@/components/TruthOffer";
import Videos from "@/components/Videos";

export default function HomePage() {
  return (
    <>
      <Topbar />
      <Header />
      <main id="top">
        <Hero />
        <Reviews />
        <StickySubnav />
        <Programs />
        <HiddenProblem />
        <Proof />
        <Method />
        <Founder />
        <Properties />
        <RealQuestion />
        <ExperienceCta />
        <FunctionalWater />
        <Testimonials />
        <Videos />
        <Products />
        <Consultation />
        <AiWhy />
        <AiPreventive />
        <EarlyDetection />
        <CoreSystems />
        <TruthOffer />
        <Faq />
      </main>
      <Footer />
      <MobileCta />
      <SiteInteractions />
    </>
  );
}
