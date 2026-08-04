import React, { useState } from 'react';
import { X, Calendar, Users, CheckCircle, AlertCircle, Loader2, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { createBooking } from '../api/bookingApi';
import type { Package } from '../api/packageApi';

interface BookingModalProps {
  pkg: Package;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ pkg, onClose, onSuccess }) => {
  // Today's date in YYYY-MM-DD for Past-Date Guard
  const todayISO = new Date().toISOString().split('T')[0]!;
  
  const [travelDate, setTravelDate] = useState<string>(todayISO);
  const [passengers, setPassengers] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);

  const totalAmount = pkg.price * passengers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createBooking(pkg.id, travelDate, passengers);
      setConfirmedBookingId(res.id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to complete booking reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reserve Tour Package</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Package Overview Card */}
          <div className="flex space-x-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            {pkg.coverImage && (
              <img
                src={pkg.coverImage}
                alt={pkg.title}
                className="w-20 h-20 object-cover rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{pkg.destination}</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{pkg.title}</h4>
              <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pkg.durationDays} Days</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">${pkg.price} / person</span>
              </div>
            </div>
          </div>

          {confirmedBookingId ? (
            /* Success Confirmation Banner */
            <div className="text-center py-6 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Booking Request Submitted!</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Reservation ID <span className="font-mono font-bold text-slate-900 dark:text-slate-200">#WND-{confirmedBookingId}</span> is now pending operator approval.
                </p>
              </div>
              <div className="pt-4 flex justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-blue-500/20"
                >
                  View My Bookings
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Date Selection with Past-Date Guard */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Select Travel Date</span>
                </label>
                <input
                  type="date"
                  min={todayISO}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <p className="text-[11px] text-slate-400">* Past dates are strictly disabled by platform security policy.</p>
              </div>

              {/* Passenger Counter Stepper */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Number of Travelers</span>
                </label>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center disabled:opacity-50"
                    disabled={passengers <= 1}
                  >
                    -
                  </button>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    {passengers} {passengers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassengers(passengers + 1)}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price Calculator */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold block">Total Payable</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">${totalAmount.toLocaleString()}</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  (${pkg.price} × {passengers})
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Reservation</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
