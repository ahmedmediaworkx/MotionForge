import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import Footer from '../../components/layout/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background-primary">
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Landing;