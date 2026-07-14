'use client';

import { useInvoiceStore } from '@/store/useInvoiceStore';

export function InvoicePreview() {
  const store = useInvoiceStore();

  const subtotal = store.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = (subtotal * store.taxRate) / 100;
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Modern Template
  if (store.template === 'modern') {
    return (
      <div className="p-12 font-sans h-full flex flex-col bg-white">
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">INVOICE</h1>
            <p className="text-slate-500 font-medium tracking-wide">#{store.invoiceNumber}</p>
          </div>
          <div className="text-right">
             <div className="w-12 h-12 bg-slate-900 rounded-xl mb-4 ml-auto"></div>
             <h2 className="text-xl font-bold text-slate-900">{store.senderName}</h2>
             <p className="text-slate-500 text-sm whitespace-pre-line mt-1 leading-relaxed">
               {store.senderAddress}
             </p>
             <p className="text-slate-500 text-sm mt-1">{store.senderEmail}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</p>
            <h3 className="text-lg font-bold text-slate-900">{store.clientName}</h3>
            <p className="text-slate-600 text-sm whitespace-pre-line mt-1 leading-relaxed">
              {store.clientAddress}
            </p>
            <p className="text-slate-600 text-sm mt-1">{store.clientEmail}</p>
          </div>
          <div className="text-right">
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Issue</p>
              <p className="text-slate-900 font-medium">{formatDate(store.date)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-slate-900 font-medium">{formatDate(store.dueDate)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Description</th>
                <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Rate</th>
                <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Qty</th>
                <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {store.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-4 text-slate-900 font-medium">{item.description || 'Item Description'}</td>
                  <td className="py-4 text-slate-600 text-right">{formatCurrency(item.rate)}</td>
                  <td className="py-4 text-slate-600 text-right">{item.quantity}</td>
                  <td className="py-4 text-slate-900 font-bold text-right">{formatCurrency(item.quantity * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-1/2 ml-auto mb-16">
          <div className="flex justify-between py-2 text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          {store.taxRate > 0 && (
            <div className="flex justify-between py-2 text-sm text-slate-600">
              <span>Tax ({store.taxRate}%)</span>
              <span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 mt-2 border-t-2 border-slate-900">
            <span className="text-lg font-bold text-slate-900">Total Due</span>
            <span className="text-xl font-black text-slate-900">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-200 pt-8 text-center">
          <p className="text-slate-400 text-sm font-medium">Thank you for your business!</p>
        </div>
      </div>
    );
  }

  // Professional Template
  if (store.template === 'professional') {
    return (
      <div className="p-12 font-serif h-full flex flex-col bg-white">
        <div className="border-b-4 border-indigo-900 pb-8 mb-12 flex justify-between items-end">
          <div>
             <h2 className="text-2xl font-bold text-indigo-900 tracking-wide uppercase">{store.senderName}</h2>
             <p className="text-slate-600 text-sm whitespace-pre-line mt-2">
               {store.senderAddress}
             </p>
          </div>
          <div className="text-right">
             <h1 className="text-5xl font-light text-slate-300 tracking-widest uppercase mb-2">Invoice</h1>
             <p className="text-slate-700 font-medium tracking-wide text-lg">No. {store.invoiceNumber}</p>
          </div>
        </div>

        <div className="flex justify-between mb-12">
          <div className="w-1/2 pr-8">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-4">Bill To</h3>
            <h4 className="text-lg font-bold text-slate-800">{store.clientName}</h4>
            <p className="text-slate-600 text-sm whitespace-pre-line mt-2 leading-relaxed">
              {store.clientAddress}
            </p>
            <p className="text-slate-600 text-sm mt-1">{store.clientEmail}</p>
          </div>
          <div className="w-1/3">
             <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-bold text-slate-500 uppercase">Date</span>
                  <span className="text-sm font-medium text-slate-800">{formatDate(store.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-500 uppercase">Due Date</span>
                  <span className="text-sm font-medium text-slate-800">{formatDate(store.dueDate)}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex-1">
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-indigo-900 text-white text-left">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-tl-lg">Description</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Rate</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Qty</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {store.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-200 bg-white">
                  <td className="py-4 px-4 text-slate-800 font-medium">{item.description || 'Item Description'}</td>
                  <td className="py-4 px-4 text-slate-600 text-right">{formatCurrency(item.rate)}</td>
                  <td className="py-4 px-4 text-slate-600 text-right">{item.quantity}</td>
                  <td className="py-4 px-4 text-slate-800 font-bold text-right">{formatCurrency(item.quantity * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-16">
          <div className="w-1/2 bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            {store.taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                <span>Tax ({store.taxRate}%)</span>
                <span className="font-medium text-slate-800">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 mt-2">
              <span className="text-lg font-bold text-indigo-900 uppercase">Total</span>
              <span className="text-2xl font-bold text-indigo-900">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Minimal Template (Default)
  return (
    <div className="p-12 font-mono h-full flex flex-col bg-white">
      <div className="flex justify-between items-start mb-16 border-b border-neutral-200 pb-8">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 mb-1">{store.senderName}</h2>
          <p className="text-neutral-500 text-xs whitespace-pre-line leading-relaxed">
            {store.senderAddress}
          </p>
        </div>
        <div className="text-right">
           <h1 className="text-2xl font-bold text-neutral-800 uppercase tracking-widest mb-4">Invoice</h1>
           <div className="text-xs text-neutral-500 space-y-1">
             <p><span className="w-24 inline-block">Invoice No:</span> {store.invoiceNumber}</p>
             <p><span className="w-24 inline-block">Date:</span> {formatDate(store.date)}</p>
             <p><span className="w-24 inline-block">Due Date:</span> {formatDate(store.dueDate)}</p>
           </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 border-b border-neutral-100 pb-1">Billed To</h3>
        <h4 className="text-base font-bold text-neutral-800">{store.clientName}</h4>
        <p className="text-neutral-500 text-xs whitespace-pre-line mt-1 leading-relaxed">
          {store.clientAddress}
        </p>
      </div>

      <div className="flex-1">
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-neutral-800 text-left">
              <th className="py-3 text-xs font-bold text-neutral-800 uppercase tracking-widest">Item</th>
              <th className="py-3 text-xs font-bold text-neutral-800 uppercase tracking-widest text-right">Cost</th>
              <th className="py-3 text-xs font-bold text-neutral-800 uppercase tracking-widest text-right">Qty</th>
              <th className="py-3 text-xs font-bold text-neutral-800 uppercase tracking-widest text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {store.items.map((item, index) => (
              <tr key={item.id} className="border-b border-neutral-100">
                <td className="py-3 text-sm text-neutral-800">{item.description || '-'}</td>
                <td className="py-3 text-sm text-neutral-600 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-3 text-sm text-neutral-600 text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-neutral-800 font-bold text-right">{formatCurrency(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-[40%] ml-auto mb-16">
        <div className="space-y-2 text-sm text-neutral-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-neutral-800">{formatCurrency(subtotal)}</span>
          </div>
          {store.taxRate > 0 && (
            <div className="flex justify-between">
              <span>Tax ({store.taxRate}%)</span>
              <span className="font-medium text-neutral-800">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 mt-2 border-t border-neutral-300">
            <span className="font-bold text-neutral-800">Total</span>
            <span className="font-bold text-neutral-800">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
