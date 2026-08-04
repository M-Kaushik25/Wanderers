import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, Loader2, Clock, Ticket, Printer, X, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBookings, type Booking } from '../api/bookingApi';

const TouristProfile = () => {
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);
  const storedUser = localStorage.getItem('wanderers_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: fetchMyBookings,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
        <p className="text-slate-500 font-medium">Loading Profile & Bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-md flex items-center space-x-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-2xl">
          {user?.name ? user.name[0].toUpperCase() : <User className="w-8 h-8" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.name || 'Tourist Profile'}</h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-bold rounded-full">
            Verified Traveler
          </span>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Ticket className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">My Bookings ({bookings?.length || 0})</h2>
        </div>

        {!bookings || bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-700">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">No active bookings yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Explore our verified tour packages and book your next unforgettable adventure!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((b: Booking) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">Booking #{b.id}</span>
                    <h3 className="text-lg font-bold mt-1 line-clamp-1">{b.package?.title || 'Tour Package'}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      {b.package?.destination || 'Global Experience'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : b.status === 'REJECTED'
                        ? 'bg-red-50 text-red-600'
                        : b.status === 'COMPLETED'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium">Travel Date</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(b.travelDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Travelers</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {b.passengers} Passenger(s)
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-400">Total Cost</p>
                    <p className="text-xl font-bold text-blue-600">${b.totalAmount}</p>
                  </div>
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => setSelectedVoucher(b)}
                      className="flex items-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20"
                    >
                      <Ticket className="w-3.5 h-3.5 mr-1.5" /> Travel Voucher
                    </button>
                  )}
                  {b.status === 'PENDING' && (
                    <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                      <Clock className="w-4 h-4 mr-1" /> Awaiting Confirmation
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Voucher Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-700 relative space-y-6"
          >
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Official Travel Pass</span>
                <h3 className="text-xl font-bold">Wanderers Booking Voucher</h3>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-slate-400">Package</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedVoucher.package?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Booking Reference</p>
                  <p className="font-mono font-bold text-blue-600">#WND-{selectedVoucher.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Passenger Name</p>
                  <p className="font-bold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Departure Date</p>
                  <p className="font-bold">{new Date(selectedVoucher.travelDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Traveler Roster</p>
                  <p className="font-bold">{selectedVoucher.passengers} Adult(s)</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment Status</p>
                  <p className="font-bold text-emerald-600 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Escrow Verified
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Voucher</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TouristProfile;
