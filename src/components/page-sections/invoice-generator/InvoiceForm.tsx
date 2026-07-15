'use client';

import { Input } from '@/components/core/Input';
import { Select } from '@/components/core/Select';
import { Button } from '@/components/core/Button';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/core/Textarea';

export function InvoiceForm() {
  const store = useInvoiceStore();

  return (
    <div className="flex flex-col gap-8">
      {/* Template Settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Select 
             label="Template Style" 
             name="template"
             value={store.template} 
             onChange={(e) => store.updateField('template', e.target.value)}
             options={[
               { value: 'minimal', label: 'Minimal' },
               { value: 'modern', label: 'Modern' },
               { value: 'professional', label: 'Professional' }
             ]}
           />
           <Input 
             label="Tax Rate (%)" 
             name="taxRate"
             type="number"
             value={store.taxRate} 
             onChange={(e) => store.updateField('taxRate', parseFloat(e.target.value) || 0)} 
           />
        </div>
      </section>

      {/* Invoice Details */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Invoice Number" 
            name="invoiceNumber"
            value={store.invoiceNumber} 
            onChange={(e) => store.updateField('invoiceNumber', e.target.value)} 
          />
          <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Date" 
               name="date"
               type="date"
               value={store.date} 
               onChange={(e) => store.updateField('date', e.target.value)} 
             />
             <Input 
               label="Due Date" 
               name="dueDate"
               type="date"
               value={store.dueDate} 
               onChange={(e) => store.updateField('dueDate', e.target.value)} 
             />
          </div>
        </div>
      </section>

      {/* Parties */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Sender</h2>
          <Input 
            label="Name / Company" 
            name="senderName"
            value={store.senderName} 
            onChange={(e) => store.updateField('senderName', e.target.value)} 
          />
          <Input 
            label="Email" 
            name="senderEmail"
            type="email"
            value={store.senderEmail} 
            onChange={(e) => store.updateField('senderEmail', e.target.value)} 
          />
          <Textarea 
            label="Address" 
            name="senderAddress"
            rows={3}
            value={store.senderAddress} 
            onChange={(e) => store.updateField('senderAddress', e.target.value)} 
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Client</h2>
          <Input 
            label="Name / Company" 
            name="clientName"
            value={store.clientName} 
            onChange={(e) => store.updateField('clientName', e.target.value)} 
          />
          <Input 
            label="Email" 
            name="clientEmail"
            type="email"
            value={store.clientEmail} 
            onChange={(e) => store.updateField('clientEmail', e.target.value)} 
          />
          <Textarea 
            label="Address" 
            name="clientAddress"
            rows={3}
            value={store.clientAddress} 
            onChange={(e) => store.updateField('clientAddress', e.target.value)} 
          />
        </section>
      </div>

      {/* Line Items */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
           <h2 className="text-lg font-semibold">Line Items</h2>
           <Button variant="outline" size="sm" onClick={store.addItem} className="h-8 gap-1.5 text-xs">
             <Plus className="w-3.5 h-3.5" />
             Add Item
           </Button>
        </div>
        
        <div className="space-y-3">
          {store.items.map((item, index) => (
            <div key={item.id} className="flex gap-3 items-start bg-surface/30 p-3 rounded-xl border border-border/50">
              <div className="flex-1 space-y-3">
                <Input 
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => store.updateItem(item.id, 'description', e.target.value)}
                />
                <div className="flex gap-3">
                  <div className="w-1/3">
                    <Input 
                      placeholder="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => store.updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-2/3">
                    <Input 
                      placeholder="Rate"
                      type="number"
                      value={item.rate}
                      onChange={(e) => store.updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => store.removeItem(item.id)}
                className="mt-1 p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
