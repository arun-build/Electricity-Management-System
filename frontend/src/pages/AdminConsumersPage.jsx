import React, { useState, useEffect } from 'react';
import { consumerAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ConsumerModal from '../components/admin/ConsumerModal';
import {
  Users,
  Search,
  Plus,
  Edit,
  Power,
  PowerOff,
  Hash,
  MapPin,
  Mail,
  Zap,
  RefreshCw,
  AlertCircle,
  Clock
} from 'lucide-react';

const AdminConsumersPage = ({ onSelectConsumerForBill }) => {
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConsumer, setEditingConsumer] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchConsumers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await consumerAPI.listConsumers(params);
      setConsumers(res.data.consumers || []);
    } catch (err) {
      console.error('Failed to load consumers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConsumers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleToggleStatus = async (consumer) => {
    const id = consumer.id || consumer._id;
    setActionLoading(id);
    try {
      await consumerAPI.toggleStatus(id);
      await fetchConsumers();
    } catch (err) {
      console.error('Failed to toggle status', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEdit = (consumer) => {
    setEditingConsumer(consumer);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingConsumer(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Consumer button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Consumers Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain customer profiles, active meter connections, and account statuses.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Consumer</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, meter # or address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'inactive'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Consumers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Consumer Details</th>
                <th className="py-3 px-4">Meter Number</th>
                <th className="py-3 px-4">Service Address</th>
                <th className="py-3 px-4">Latest Meter Reading</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Dues Alert</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Loading consumers...</span>
                  </td>
                </tr>
              ) : consumers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching consumer records found.
                  </td>
                </tr>
              ) : (
                consumers.map((c) => {
                  const id = c.id || c._id;
                  const isActive = c.status === 'active';
                  const isActioning = actionLoading === id;

                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {c.name}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{c.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5 text-blue-500" />
                          <span>{c.meter_number || 'Unassigned'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-400 truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{c.address || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {c.latest_reading} kWh
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.last_billed_month}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        {c.unpaid_bills_count > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/60">
                            <AlertCircle className="w-3 h-3" />
                            {c.unpaid_bills_count} Unpaid Bill{c.unpaid_bills_count > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">All Cleared</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inline Status Toggle */}
                          <button
                            onClick={() => handleToggleStatus(c)}
                            disabled={isActioning}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isActive
                                ? 'border-amber-200 hover:bg-amber-50 text-amber-600 dark:border-amber-800 dark:hover:bg-amber-950/40'
                                : 'border-emerald-200 hover:bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950/40'
                            }`}
                            title={isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Details Button */}
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Edit consumer details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Bill Trigger Button */}
                          {isActive && (
                            <button
                              onClick={() => {
                                if (onSelectConsumerForBill) {
                                  onSelectConsumerForBill(c);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-semibold transition-colors flex items-center gap-1"
                              title="Enter meter reading for this consumer"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Bill</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ConsumerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        consumer={editingConsumer}
        onSuccess={fetchConsumers}
      />
    </div>
  );
};

export default AdminConsumersPage;
