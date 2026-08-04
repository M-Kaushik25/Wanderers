import { Link } from 'react-router-dom';
import { Plane, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Wanderers
            </span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Wanderers is a B2B2C tourism marketplace connecting travelers directly to verified tour operators worldwide.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">Explore</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li><Link to="/packages" className="hover:text-blue-600 transition-colors">Tour Packages</Link></li>
            <li><Link to="/destinations" className="hover:text-blue-600 transition-colors">Destinations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">Account</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li><Link to="/login" className="hover:text-blue-600 transition-colors">Sign In / Register</Link></li>
            <li><Link to="/profile" className="hover:text-blue-600 transition-colors">My Bookings</Link></li>
            <li><Link to="/operator" className="hover:text-blue-600 transition-colors">Operator Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">Support</h4>
          <ul className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li><Link to="/help" className="hover:text-blue-600 transition-colors flex items-center"><HelpCircleIcon className="w-3.5 h-3.5 mr-1" /> Help Center & FAQ</Link></li>
            <li className="flex items-center text-emerald-600 font-semibold"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Operator Guarantee</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} Wanderers Marketplace Inc. All rights reserved.</p>
        <p className="flex items-center justify-center">
          Built with <Heart className="w-3.5 h-3.5 mx-1 text-red-500 fill-current" /> for global travelers & tour operators.
        </p>
      </div>
    </footer>
  );
};

const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Footer;
