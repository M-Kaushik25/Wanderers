/**
 * BookingModal Component — SCR-08 (Booking Modal) Implementation
 * Spec source: docs/ux_planning_and_screen_specs.md § Phase 4 (4.2) and § Phase 6 (6.1)
 *
 * Required behaviors per spec:
 *  - Date picker: past dates disabled via min={today} attribute
 *  - Passenger counter: +/- stepper, range 1–10
 *  - Dynamic total price: price * passengers (live recalculate)
 *  - Submit states: idle | in-flight (spinner) | success (green checkmark) | error (inline alert)
 *  - On success: show Reservation ID as #WND-{id} and "Booking Confirmed!" notice
 *  - Backdrop: bg-slate-900/60 backdrop-blur-sm (Phase 10.1 wireframe spec)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { createBooking } from '../api/bookingApi';
import type { Package } from '../api/packageApi';

interface BookingModalProps {
  pkg: Package;
  onClose: () => void;
  onBookingSuccess?: () => void;
}


export const BookingModal: React.FC<BookingModalProps> = ({ pkg, onClose, onBookingSuccess }) => {
  // Today's YYYY-MM-DD string for Past-Date Guard (SCR-08 spec)
  const todayISO = new Date().toISOString().split('T')[0]!;

  // Form state
  const [travelDate, setTravelDate] = useState<string>(todayISO);
  const [passengers, setPassengers] = useState<number>(1);

  // Async state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);

  // Live total price calculation: price × passengers
  const totalAmount = pkg.price * passengers;

  // Dismiss on Escape key (Phase 4.2 accessibility requirement)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const decrementPassengers = () => setPassengers((p) => Math.max(1, p - 1));
  const incrementPassengers = () => setPassengers((p) => Math.min(10, p + 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelDate) {
      setErrorMessage('Please select a travel date.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const booking = await createBooking(pkg.id, travelDate, passengers);
      setConfirmedBookingId(booking.id);
      if (onBookingSuccess) onBookingSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'An unexpected error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop — per Phase 10.1: bg-slate-900/60 backdrop-blur-sm */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={`Reserve ${pkg.title}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden"
        >
          {/* ── Modal Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Reserve Tour Package
                </h2>
                <p className="text-xs text-slate-400">Secure booking powered by Wanderers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close booking modal"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* ── Modal Body ── */}
          <div className="p-6 space-y-5">
            {/* Package Summary Card */}
            <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              {pkg.coverImage && (
                <img
                  src={pkg.coverImage}
                  alt={pkg.title}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-slate-200/60 dark:border-slate-700/40 shadow-sm"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{pkg.destination}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                  {pkg.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {pkg.durationDays} Days
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ${pkg.price.toLocaleString()} <span className="font-normal text-slate-400">/ person</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ── Success State ── */}
            {confirmedBookingId ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-11 h-11 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Booking Confirmed!
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your reservation{' '}
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      #WND-{confirmedBookingId}
                    </span>{' '}
                    is pending operator approval.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/25"
                  >
                    View My Bookings
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Booking Form ── */
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Error Alert */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300 leading-snug">{errorMessage}</p>
                  </motion.div>
                )}

                {/* Travel Date — Past-Date Guard (min={today}) */}
                <div className="space-y-2">
                  <label
                    htmlFor="booking-travel-date"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Select Travel Date
                  </label>
                  <input
                    id="booking-travel-date"
                    type="date"
                    required
                    min={todayISO}
                    value={travelDate}
                    onChange={(e) => {
                      setTravelDate(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 leading-tight">
                    * Past dates are disabled per platform policy. Travel date must be today or later.
                  </p>
                </div>

                {/* Passenger Counter Stepper — 1 to 10 */}
                <div className="space-y-2">
                  <label
                    htmlFor="booking-passengers"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Number of Travelers
                  </label>
                  <div className="flex items-center justify-between gap-3 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <button
                      type="button"
                      id="booking-passengers"
                      onClick={decrementPassengers}
                      disabled={passengers <= 1}
                      className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Decrease travelers"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {passengers}
                      </span>
                      <span className="ml-1.5 text-sm text-slate-500 dark:text-slate-400">
                        {passengers === 1 ? 'Traveler' : 'Travelers'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={incrementPassengers}
                      disabled={passengers >= 10}
                      className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Increase travelers"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Total Price Calculator */}
                <div className="flex items-center justify-between px-5 py-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
                      Total Payable
                    </p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      ${totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-right leading-relaxed">
                    ${pkg.price.toLocaleString()}<br />
                    <span className="text-slate-400">× {passengers} pax</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
