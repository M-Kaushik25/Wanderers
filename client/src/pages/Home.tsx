import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Beautiful landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Discover Your Next <span className="text-blue-400">Adventure</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto"
          >
            Explore the world's most beautiful destinations with hand-picked tour packages.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full max-w-4xl mx-auto flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 flex items-center bg-white/20 rounded-full px-4 py-3">
              <MapPin className="w-5 h-5 mr-2 text-blue-200" />
              <input type="text" placeholder="Where to?" className="bg-transparent border-none outline-none w-full text-white placeholder:text-blue-100" />
            </div>
            <div className="flex-1 flex items-center bg-white/20 rounded-full px-4 py-3">
              <Calendar className="w-5 h-5 mr-2 text-blue-200" />
              <input type="date" className="bg-transparent border-none outline-none w-full text-white" />
            </div>
            <div className="flex-1 flex items-center bg-white/20 rounded-full px-4 py-3">
              <DollarSign className="w-5 h-5 mr-2 text-blue-200" />
              <input type="number" placeholder="Budget" className="bg-transparent border-none outline-none w-full text-white placeholder:text-blue-100" />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center transition-colors">
              <Search className="w-5 h-5 mr-2" />
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8">Trending Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div 
              whileHover={{ y: -10 }}
              key={i} 
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={`https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                  alt="Bali"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Tropical Paradise</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> Bali, Indonesia
                    </p>
                  </div>
                  <span className="font-bold text-lg text-blue-600">$899</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                  Experience the pristine beaches, lush jungles, and vibrant culture of Bali in this 7-day adventure.
                </p>
                <Link to="/packages" className="text-blue-600 font-semibold hover:underline">
                  View Details →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
