import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { consumerAPI } from '../../services/api';
import { User, Mail, MapPin, Hash, Lock, AlertCircle, Loader2 } from 'lucide-react';

const ConsumerModal = ({ isOpen, onClose, consumer, onSuccess }) => {
  const isEdit = !!consumer;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('consumer123');
  const [status, setStatus] = useState('active');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (consumer) {
      setName(consumer.name || '');
      setEmail(consumer.email || '');
      setMeterNumber(consumer.meter_number || '');
      setAddress(consumer.address || '');
      setStatus(consumer.status || 'active');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setMeterNumber('');
      setAddress('');
      setPassword('consumer123');
      setStatus('active');
    }
    setError(null);
  }, [consumer, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        const payload = { name, email, meter_number: meterNumber, address, status };
        await consumerAPI.updateConsumer(consumer.id || consumer._id, payload);
      } else {
        const payload = {
          name,
          email,
          password: password || 'consumer123',
          meter_number: meterNumber || undefined,
          address,
        };
        await consumerAPI.createConsumer(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed. Please verify input data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Consumer Profile' : 'Register New Consumer'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-500" /> Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            placeholder="e.g. Alex Johnson"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-500" /> Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            placeholder="alex@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-blue-500" /> Meter Number
          </label>
          <input
            type="text"
            value={meterNumber}
            onChange={(e) => setMeterNumber(e.target.value.toUpperCase())}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            placeholder="Auto-generated if left blank (e.g. ELEC-99201)"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-500" /> Service Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            placeholder="123 Main Street, Suite 4B"
          />
        </div>

        {!isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-500" /> Initial Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="consumer123"
            />
          </div>
        )}

        {isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive / Deactivated</option>
            </select>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 text-sm flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEdit ? 'Save Changes' : 'Create Consumer'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsumerModal;
