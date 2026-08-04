import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, ShieldCheck, DollarSign, Package as PackageIcon, Calendar, CheckCircle, XCircle, Loader2, ShieldAlert, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyCompany, createCompany } from '../api/companyApi';
import { fetchCompanyBookings, updateBookingStatus, type Booking } from '../api/bookingApi';

const OperatorDashboard = () => {
  const queryClient = useQueryClient();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');

  // Queries
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['myCompany'],
    queryFn: fetchMyCompany,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['companyBookings'],
    queryFn: fetchCompanyBookings,
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyBookings'] });
    },
  });

  const setupCompanyMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCompany'] });
      setIsSetupOpen(false);
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    statusMutation.mutate({ id, status });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setupCompanyMutation.mutate({
      name,
      description,
      gstNumber,
      licenseUrl,
    });
  };

  const totalRevenue = bookings
    ? bookings
        .filter((b: Booking) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0)
    : 0;

  if (companyLoading || bookingsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
        <p className="text-slate-500 font-medium">Loading Operator Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Building className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold">{company?.name || 'My Tour Agency'}</h1>
            {company?.isVerified ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Operator
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Verification Pending
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            {company?.description || 'Registered Tour Operator profile on Wanderers B2B2C Marketplace.'}
          </p>
        </div>

        <button
          onClick={() => {
            setName(company?.name || '');
            setDescription(company?.description || '');
            setGstNumber(company?.gstNumber || '');
            setLicenseUrl(company?.licenseUrl || '');
            setIsSetupOpen(true);
          }}
          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl text-sm font-bold transition-all"
        >
          Edit Agency Profile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-4"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Earnings</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              ${totalRevenue}
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-4"
        >
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Bookings</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {bookings?.length || 0}
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-4"
        >
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600">
            <PackageIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Agency Status</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {company?.isVerified ? 'Active & Verified' : 'Standard'}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Booking Management Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Incoming Tourist Bookings</h2>

        {!bookings || bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No customer bookings received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Tourist Name</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Travel Date</th>
                  <th className="py-3 px-4">Travelers</th>
                  <th className="py-3 px-4">Total Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {bookings.map((b: Booking) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">#{b.id}</td>
                    <td className="py-3.5 px-4 font-medium">
                      {b.tourist?.name || 'Tourist'}
                      <span className="block text-xs text-slate-400">{b.tourist?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{b.package?.title || 'Tour'}</td>
                    <td className="py-3.5 px-4">{new Date(b.travelDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">{b.passengers} pax</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">${b.totalAmount}</td>
                    <td className="py-3.5 px-4">
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
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all"
                            title="Confirm Booking"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(b.id, 'REJECTED')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                            title="Reject Booking"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agency Profile Modal */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsSetupOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold">Edit Agency Profile</h3>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Agency Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">GST Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Operating License URL</label>
                <input
                  type="text"
                  value={licenseUrl}
                  onChange={(e) => setLicenseUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={setupCompanyMutation.isPending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
              >
                Save Agency Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
