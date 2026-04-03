import { useEffect, useMemo, useState } from "react";

import { Button } from "../common/Button";
import { DatePicker } from "../common/DatePicker";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

const createDefaultItem = () => ({ name: "", quantity: 1, unit_price: "" });

const defaultValues = {
  client_name: "",
  client_email: "",
  issue_date: "",
  due_date: "",
  currency: "INR",
  tax_percent: "0.00",
  status: "draft",
  notes: "",
  items: [createDefaultItem()],
};

export function InvoiceForm({ initialValues, onSubmit, submitting, onCancel }) {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initialValues) {
      setValues(defaultValues);
      return;
    }
    setValues({
      client_name: initialValues.client_name || "",
      client_email: initialValues.client_email || "",
      issue_date: initialValues.issue_date || "",
      due_date: initialValues.due_date || "",
      currency: initialValues.currency || "INR",
      tax_percent: initialValues.tax_percent || "0.00",
      status: initialValues.status || "draft",
      notes: initialValues.notes || "",
      items: initialValues.items?.length
        ? initialValues.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        : [createDefaultItem()],
    });
  }, [initialValues]);

  const totals = useMemo(() => {
    const subtotal = values.items.reduce((sum, item) => {
      const line = Number(item.quantity || 0) * Number(item.unit_price || 0);
      return sum + line;
    }, 0);
    const tax = subtotal * (Number(values.tax_percent || 0) / 100);
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2),
    };
  }, [values.items, values.tax_percent]);

  const validate = () => {
    const nextErrors = {};
    if (!values.client_name.trim()) nextErrors.client_name = "Client name is required.";
    if (!values.client_email.trim()) nextErrors.client_email = "Client email is required.";
    if (!values.issue_date) nextErrors.issue_date = "Issue date is required.";
    if (!values.items.length) nextErrors.items = "At least one item is required.";
    if (values.items.some((item) => !item.name || Number(item.quantity) <= 0 || Number(item.unit_price) <= 0)) {
      nextErrors.items = "Each item needs valid name, quantity, and price.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...values,
      tax_percent: Number(values.tax_percent || 0).toFixed(2),
      items: values.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price).toFixed(2),
      })),
    });
  };

  const updateItem = (index, key, value) => {
    const nextItems = [...values.items];
    nextItems[index] = { ...nextItems[index], [key]: value };
    setValues((prev) => ({ ...prev, items: nextItems }));
  };

  const addItem = () => setValues((prev) => ({ ...prev, items: [...prev.items, createDefaultItem()] }));
  const removeItem = (index) =>
    setValues((prev) => ({ ...prev, items: prev.items.filter((_, itemIndex) => itemIndex !== index) }));

  return (
    <form className="card space-y-6 p-6 sm:p-7" onSubmit={submit}>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Invoice form</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {initialValues ? "Refine an existing invoice" : "Create a polished invoice"}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add client details, line items, and billing status so revenue reporting stays accurate across the app.
          </p>
        </div>

        <div className="surface-card min-w-[220px] px-4 py-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Projected total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.total}</p>
          <p className="mt-1 text-slate-500">Updated instantly as line items and tax change.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section className="surface-card p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Client</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-950">Who this invoice is for</h4>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Client Name"
                value={values.client_name}
                error={errors.client_name}
                onChange={(e) => setValues((prev) => ({ ...prev, client_name: e.target.value }))}
              />
              <Input
                label="Client Email"
                type="email"
                value={values.client_email}
                error={errors.client_email}
                onChange={(e) => setValues((prev) => ({ ...prev, client_email: e.target.value }))}
              />
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Billing setup</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-950">Dates, tax, and status</h4>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DatePicker
                label="Issue Date"
                value={values.issue_date}
                error={errors.issue_date}
                onChange={(e) => setValues((prev) => ({ ...prev, issue_date: e.target.value }))}
              />
              <DatePicker
                label="Due Date"
                value={values.due_date}
                onChange={(e) => setValues((prev) => ({ ...prev, due_date: e.target.value }))}
              />
              <Input
                label="Tax %"
                type="number"
                step="0.01"
                value={values.tax_percent}
                onChange={(e) => setValues((prev) => ({ ...prev, tax_percent: e.target.value }))}
              />
              <Select
                label="Status"
                value={values.status}
                onChange={(e) => setValues((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </Select>
            </div>
          </section>
        </div>

        <section className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Totals</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-950">Invoice summary</h4>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">{totals.subtotal}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
              <span className="text-slate-500">Tax</span>
              <span className="font-semibold text-slate-900">{totals.tax}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
              <span>Total</span>
              <span className="text-lg font-semibold">{totals.total}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="surface-card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Line items</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-950">What the client is being billed for</h4>
          </div>
          <Button type="button" variant="secondary" onClick={addItem}>
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {values.items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1.4fr)_120px_150px_110px]"
            >
              <Input
                label={`Item ${index + 1}`}
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
              />
              <Input
                label="Qty"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
              />
              <Input
                label="Unit price"
                type="number"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(index, "unit_price", e.target.value)}
              />
              <div className="flex items-end">
                <Button type="button" variant="secondary" className="w-full" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        {errors.items ? <p className="mt-1 text-xs text-rose-600">{errors.items}</p> : null}
      </section>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Notes</span>
        <textarea
          className="input min-h-[140px] resize-y"
          placeholder="Add payment instructions, delivery notes, or anything the client should know."
          value={values.notes}
          onChange={(e) => setValues((prev) => ({ ...prev, notes: e.target.value }))}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Invoice"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
