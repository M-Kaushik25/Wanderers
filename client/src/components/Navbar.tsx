import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, User, LogOut, Building, Shield, Ticket } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('wanderers_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('wanderers_token');
    localStorage.removeItem('wanderers_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Wanderers
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/packages" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors font-medium">
              Packages
            </Link>
            {user?.role === 'OPERATOR' && (
              <Link to="/operator" className="text-blue-600 font-bold hover:underline flex items-center space-x-1">
                <Building className="w-4 h-4 mr-1" /> Operator Dashboard
              </Link>
            )}
            {user?.role === 'TOURIST' && (
              <Link to="/profile" className="text-blue-600 font-bold hover:underline flex items-center space-x-1">
                <Ticket className="w-4 h-4 mr-1" /> My Bookings
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-purple-600 font-bold hover:underline flex items-center space-x-1">
                <Shield className="w-4 h-4 mr-1" /> Admin Dashboard
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={user.role === 'OPERATOR' ? '/operator' : user.role === 'ADMIN' ? '/admin' : '/profile'}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-sm font-semibold hover:opacity-90 transition-all"
                >
                  {user.role === 'OPERATOR' ? (
                    <Building className="w-4 h-4" />
                  ) : user.role === 'ADMIN' ? (
                    <Shield className="w-4 h-4 text-purple-600" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span>Hi, {user.name}</span>
                  {user.role === 'OPERATOR' && (
                    <span className="ml-1 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-blue-600 text-white rounded-full">
                      Operator
                    </span>
                  )}
                  {user.role === 'ADMIN' && (
                    <span className="ml-1 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-purple-600 text-white rounded-full">
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
