/**
 * TouristProfile Page — SCR-05 Implementation
 * Spec source: docs/ux_planning_and_screen_specs.md § Phase 3 (SCR-05), Phase 6 (6.1), Phase 13
 *
 * Requirements:
 * - Display tourist's profile card (name, email, Verified Traveler badge)
 * - Booking history grid with status badges (PENDING=amber, CONFIRMED=emerald, etc.)
 * - Travel Voucher modal for CONFIRMED bookings (print support)
 * - Voucher shows: #WND-{id}, package title, destination, travel date, passengers, total
 * - Escape key dismisses voucher modal (accessibility)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  MapPin,
  Loader2,
  Clock,
  Ticket,
  Printer,
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBookings, type Booking, type BookingStatus } from '../api/bookingApi';

// Booking status pill styles — Phase 7 lifecycle diagram colors
const STATUS_STYLES: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  PENDING: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  COMPLETED: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  REJECTED: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
  CANCELLED: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  PENDING: 'Awaiting Confirmation',
  COMPLETED: 'Trip Completed',
  REJECTED: 'Declined',
  CANCELLED: 'Cancelled'
};

const TouristProfile = () => {
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);

  const storedUser = localStorage.getItem('wanderers_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ['myBookings'],
    queryFn: fetchMyBookings,
    staleTime: 30_000
  });

  // Escape key dismisses the voucher modal (accessibility - Phase 4.2)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedVoucher(null);
  }, []);
  useEffect(() => {
    if (selectedVoucher) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedVoucher, handleKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your profile & bookings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-red-500">
        <AlertCircle className="w-10 h-10" />
        <p className="font-medium">Failed to load your booking history. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* ── Tourist Profile Card (SCR-05 header) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-md"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-extrabold text-2xl flex-shrink-0">
            {user?.name ? user.name[0].toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.name || 'Tourist Profile'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Traveler
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── My Bookings Section (SCR-05 booking history) ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <Ticket className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Bookings
            <span className="ml-2 text-base font-normal text-slate-400">
              ({bookings?.length ?? 0})
            </span>
          </h2>
        </div>

        {/* Empty State */}
        {!bookings || bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-14 text-center border border-slate-100 dark:border-slate-700">
            <Calendar className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No bookings yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
              Explore verified tour packages and book your next unforgettable adventure!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {bookings.map((booking: Booking, i: number) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow"
              >
                {/* Booking Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      #WND-{booking.id}
                    </p>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                      {booking.package?.title || 'Tour Package'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      {booking.package?.destination || 'Destination'}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[booking.status]}`}>
                    {STATUS_LABELS[booking.status]}
                  </span>
                </div>

                {/* Trip Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium">Travel Date</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(booking.travelDate).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Duration</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {booking.package?.durationDays ?? '–'} Days
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Travelers</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {booking.passengers} Adult{booking.passengers > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Tour Company</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1 truncate">
                      {booking.package?.company?.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      )}
                      <span className="truncate">{booking.package?.company?.name || '–'}</span>
                    </p>
                  </div>
                </div>

                {/* Footer: total + action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <div>
                    <p className="text-xs text-slate-400">Total Cost</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ${booking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => setSelectedVoucher(booking)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      Travel Voucher
                    </button>
                  )}
                  {booking.status === 'PENDING' && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 text-xs font-bold rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      Awaiting Confirmation
                    </span>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Trip Completed
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Travel Voucher Modal (printable - SCR-05 recommendation from Phase 13) ── */}
      <AnimatePresence>
        {selectedVoucher && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedVoucher(null); }}
            role="dialog"
            aria-modal="true"
            aria-label="Travel Voucher"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-700 relative space-y-6"
            >
              <button
                onClick={() => setSelectedVoucher(null)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close voucher"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Voucher Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Official Travel Pass
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Wanderers Booking Voucher
                  </h3>
                </div>
              </div>

              {/* Voucher Details */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Tour Package</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {selectedVoucher.package?.title}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {selectedVoucher.package?.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-0.5">Booking Reference</p>
                    <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-base">
                      #WND-{selectedVoucher.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-xs text-slate-400">Passenger Name</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{user?.name}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-xs text-slate-400">Departure Date</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {new Date(selectedVoucher.travelDate).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-xs text-slate-400">Traveler Roster</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedVoucher.passengers} Adult{selectedVoucher.passengers > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-xs text-slate-400">Tour Company</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                      {selectedVoucher.package?.company?.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      {selectedVoucher.package?.company?.name || '–'}
                    </p>
                  </div>
                  <div className="col-span-2 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-between">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Total Amount</p>
                    <p className="font-black text-blue-600 dark:text-blue-400 text-xl">
                      ${selectedVoucher.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Print Action */}
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                Print / Save Voucher
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TouristProfile;
