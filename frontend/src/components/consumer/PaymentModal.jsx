import React, { useState } from 'react';
import Modal from '../common/Modal';
import { billAPI } from '../../services/api';
import {
  CreditCard,
  Building,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, bill, onPaymentSuccess }) => {
  const [method, setMethod] = useState('credit_card'); // 'credit_card', 'upi', 'net_banking'
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [cardName, setCardName] = useState('Alex Johnson');
  const [upiId, setUpiId] = useState('alex@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  if (!bill) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Simulate realistic payment gateway latency
      await new Promise((r) => setTimeout(r, 1200));

      const payload = {
        payment_method: method,
        card_last4: method === 'credit_card' ? cardNumber.replace(/\s+/g, '').slice(-4) : null,
      };

      const res = await billAPI.payBill(bill.id || bill._id, payload);
      setSuccessData(res.data);
      if (onPaymentSuccess) {
        onPaymentSuccess(res.data.bill);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Payment transaction failed. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successData ? 'Payment Receipt' : 'Secure Payment Checkout'}
      maxWidth="max-w-lg"
    >
      {successData ? (
        /* Success Screen */
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Payment Successful!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your electricity bill payment has been processed and confirmed.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {successData.transaction_id}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Billing Month</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {bill.billing_month}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Meter Number</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {bill.meter_number}
              </span>
            </div>
            <div className="flex justify-between py-1 text-sm font-bold pt-1">
              <span className="text-slate-700 dark:text-slate-300">Amount Paid</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                ${Number(bill.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors"
            >
              Done & Return
            </button>
          </div>
        </div>
      ) : (
        /* Payment Checkout Form */
        <form onSubmit={handlePay} className="space-y-5">
          {/* Bill summary snippet */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Statement</span>
              <div className="font-bold text-slate-900 dark:text-white">
                {bill.billing_month} ({bill.units_consumed} kWh)
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Payable</span>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                ${Number(bill.total_amount).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('credit_card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'credit_card'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'upi'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('net_banking')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'net_banking'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building className="w-5 h-5 mb-1" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Conditional Method Inputs */}
          {method === 'credit_card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  placeholder="e.g. Alex Johnson"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="789"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'upi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  placeholder="username@bank"
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <QrCode className="w-16 h-16 mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">Scan QR Code using any UPI App (GPay, PhonePe, Paytm)</p>
              </div>
            </div>
          )}

          {method === 'net_banking' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Choose Bank
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="Chase / J.P. Morgan">Chase / J.P. Morgan</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="Bank of America">Bank of America</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Citibank">Citibank</option>
              </select>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" /> 256-bit SSL Encrypted
            </span>
            <span>Simulated Gateway</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={processing}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Pay ${Number(bill.total_amount).toFixed(2)}</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PaymentModal;
