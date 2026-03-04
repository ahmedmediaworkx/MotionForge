import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Motion Designer',
    avatar: 'SC',
    content: 'MotionForge has completely transformed my workflow. I can create stunning animations in minutes instead of hours. The browser-based approach is a game-changer!',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Content Creator',
    avatar: 'MJ',
    content: 'As a YouTuber, I need to create animations quickly. MotionForge lets me do exactly that without any software installation. Absolutely love it!',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Startup Founder',
    avatar: 'ER',
    content: 'We use MotionForge for all our marketing videos. The team collaboration feature is fantastic, and the export quality is top-notch.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'UX Designer',
    avatar: 'DK',
    content: 'The timeline editor is incredibly intuitive. I was able to create complex animations even as a beginner. Highly recommended!',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-clash text-text-primary mb-4">
            Loved by
            <span className="text-gradient"> Creators</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join thousands of creators who trust MotionForge for their animation needs.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-[350px] snap-center"
            >
              <Card className="h-full">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Content */}
                <p className="text-text-secondary mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-lime flex items-center justify-center text-background-primary font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-text-muted">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;