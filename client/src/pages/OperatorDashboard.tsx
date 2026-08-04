/**
 * OperatorDashboard Page — SCR-06 Implementation
 * Spec source: docs/ux_planning_and_screen_specs.md § Phase 3 (SCR-06), Phase 7 (Booking Lifecycle)
 *
 * Requirements per spec:
 * - Agency header: company name, verified/pending badge, description, Edit button
 * - Analytics stats: Total Earnings, Total Bookings, Agency Status
 * - Incoming Tourist Bookings table with:
 *   - Booking ID, Tourist name + email, Package, Travel Date, Travelers, Total Price, Status badge
 *   - Actions: PENDING -> Confirm ✓ | Reject ✗; CONFIRMED -> Mark Completed
 * - Agency Profile edit modal (company onboarding / GST validation — MOD-03)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building,
  ShieldCheck,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldAlert,
  X,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyCompany, createCompany } from '../api/companyApi';
import { fetchCompanyBookings, updateBookingStatus, type Booking, type BookingStatus } from '../api/bookingApi';

// Status pill colors — Phase 7 Booking Lifecycle
const STATUS_STYLES: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  PENDING: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  COMPLETED: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  REJECTED: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
  CANCELLED: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
};

const OperatorDashboard = () => {
  const queryClient = useQueryClient();

  // Company profile modal state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');

  // ─── Data Queries ───────────────────────────────────────────────────────
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['myCompany'],
    queryFn: fetchMyCompany,
    staleTime: 60_000
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['companyBookings'],
    queryFn: fetchCompanyBookings,
    staleTime: 30_000
  });

  // ─── Mutations ──────────────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyBookings'] });
    }
  });

  const companyMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCompany'] });
      setIsSetupOpen(false);
    }
  });

  // ─── Computed Analytics ─────────────────────────────────────────────────
  const confirmedAndCompleted = (bookings ?? []).filter(
    (b: Booking) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
  );
  const totalRevenue = confirmedAndCompleted.reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);
  const pendingCount = (bookings ?? []).filter((b: Booking) => b.status === 'PENDING').length;

  const openEditModal = () => {
    setCompanyName(company?.name || '');
    setCompanyDescription(company?.description || '');
    setGstNumber(company?.gstNumber || '');
    setLicenseUrl(company?.licenseUrl || '');
    setIsSetupOpen(true);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    companyMutation.mutate({
      name: companyName,
      description: companyDescription,
      gstNumber,
      licenseUrl
    });
  };

  // ─── Loading State ──────────────────────────────────────────────────────
  if (companyLoading || bookingsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading Operator Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* ── Agency Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5"
      >
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Building className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {company?.name || 'My Tour Agency'}
            </h1>
            {company?.isVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Operator
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                <ShieldAlert className="w-3.5 h-3.5" />
                Verification Pending
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            {company?.description || 'Registered Tour Operator profile on Wanderers B2B2C Marketplace.'}
          </p>
        </div>

        <button
          onClick={openEditModal}
          className="flex-shrink-0 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-sm font-bold transition-all"
        >
          Edit Agency Profile
        </button>
      </motion.div>

      {/* ── Analytics Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: <DollarSign className="w-7 h-7" />,
            color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600',
            label: 'Total Earnings',
            value: `$${totalRevenue.toLocaleString()}`,
            delay: 0
          },
          {
            icon: <Calendar className="w-7 h-7" />,
            color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
            label: 'Total Bookings',
            value: bookings?.length ?? 0,
            delay: 0.08
          },
          {
            icon: <TrendingUp className="w-7 h-7" />,
            color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
            label: 'Pending Approvals',
            value: pendingCount,
            delay: 0.16
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Incoming Tourist Bookings Table (SCR-06 core) ── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Incoming Tourist Bookings
            </h2>
          </div>
        </div>

        {!bookings || bookings.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No customer bookings received yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Tourist</th>
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4">Travel Date</th>
                  <th className="py-3.5 px-4">Travelers</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {(bookings as Booking[]).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      #{b.id}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {b.tourist?.name || 'Tourist'}
                      </p>
                      <p className="text-xs text-slate-400">{b.tourist?.email}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[160px]">
                      <span className="line-clamp-1">{b.package?.title || 'Tour'}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{b.package?.destination}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                      {new Date(b.travelDate).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                      {b.passengers} pax
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${b.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => statusMutation.mutate({ id: b.id, status: 'CONFIRMED' })}
                              disabled={statusMutation.isPending}
                              title="Confirm Booking"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 text-emerald-600 rounded-lg transition-all disabled:opacity-50"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ id: b.id, status: 'REJECTED' })}
                              disabled={statusMutation.isPending}
                              title="Reject Booking"
                              className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 rounded-lg transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => statusMutation.mutate({ id: b.id, status: 'COMPLETED' })}
                            disabled={statusMutation.isPending}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Agency Profile Edit Modal (MOD-03 Company Onboarding) ── */}
      <AnimatePresence>
        {isSetupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative space-y-5 border border-slate-100 dark:border-slate-700"
            >
              <button
                onClick={() => setIsSetupOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Agency Profile</h3>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                {[
                  { label: 'Agency Name', val: companyName, set: setCompanyName, type: 'text', required: true },
                  { label: 'GST Number', val: gstNumber, set: setGstNumber, type: 'text', required: false },
                  { label: 'Operating License URL', val: licenseUrl, set: setLicenseUrl, type: 'text', required: false }
                ].map(({ label, val, set, type, required }) => (
                  <div key={label}>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">{label}</label>
                    <input
                      type={type}
                      required={required}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={companyMutation.isPending}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {companyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Agency Details
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperatorDashboard;
