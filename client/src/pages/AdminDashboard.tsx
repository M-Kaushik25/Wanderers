import { Shield, ShieldCheck, Building, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllCompanies, verifyCompany, type Company } from '../api/companyApi';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: fetchAllCompanies,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: number; isVerified: boolean }) => verifyCompany(id, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCompanies'] });
    },
  });

  const handleToggleVerify = (id: number, currentStatus: boolean) => {
    verifyMutation.mutate({ id, isVerified: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
        <p className="text-slate-500 font-medium">Loading Admin Operations Panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Control Tower</h1>
            <p className="text-slate-400 text-sm">Platform Governance & Operator Verification</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" /> Registered Tour Companies ({companies?.length || 0})
          </h2>
        </div>

        {!companies || companies.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No tour companies registered in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">GST / Tax ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {companies.map((c: Company) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">#{c.id}</td>
                    <td className="py-3.5 px-4 font-bold">{c.name}</td>
                    <td className="py-3.5 px-4">
                      {c.user?.name || 'Owner'}
                      <span className="block text-xs text-slate-400">{c.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">{c.gstNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {c.isVerified ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleVerify(c.id, c.isVerified)}
                        disabled={verifyMutation.isPending}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          c.isVerified
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {c.isVerified ? 'Revoke Verification' : 'Verify Agency'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
