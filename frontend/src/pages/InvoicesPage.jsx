import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { invoiceService } from "../api/invoiceService";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { Table } from "../components/common/Table";
import { InvoiceForm } from "../components/forms/InvoiceForm";
import { apiErrorMessage, formatCurrency } from "../utils/formatters";

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

const statusStyles = {
  draft: "bg-slate-200 text-slate-700 ring-slate-300",
  sent: "bg-sky-100 text-sky-700 ring-sky-200",
  paid: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  overdue: "bg-rose-100 text-rose-700 ring-rose-200",
};

export function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      const response = await invoiceService.list(params);
      const payload = response.data.data;
      setInvoices(unwrapList(payload));
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not load invoices."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters.search, filters.status]);

  useEffect(() => {
    const next = {};
    if (filters.search) next.search = filters.search;
    if (filters.status) next.status = filters.status;
    setSearchParams(next, { replace: true });
  }, [filters.search, filters.status, setSearchParams]);

  const onSave = async (values) => {
    try {
      setSubmitting(true);
      if (selectedInvoice) {
        await invoiceService.update(selectedInvoice.id, values);
        toast.success("Invoice updated.");
      } else {
        await invoiceService.create(values);
        toast.success("Invoice created.");
      }
      setSelectedInvoice(null);
      setShowForm(false);
      await fetchInvoices();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save invoice."));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await invoiceService.remove(id);
      toast.success("Invoice deleted.");
      await fetchInvoices();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete invoice."));
    }
  };

  const onDownloadPdf = async (invoice) => {
    try {
      const response = await invoiceService.downloadPdf(invoice.id);
      const blobUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${invoice.invoice_number || "invoice"}.pdf`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error(apiErrorMessage(error, "PDF download failed."));
    }
  };

  const columns = [
    { key: "invoice_number", header: "Invoice #" },
    { key: "client_name", header: "Client" },
    { key: "issue_date", header: "Issue Date" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${
            statusStyles[row.status] || statusStyles.draft
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (row) => <span className="font-semibold text-slate-900">{formatCurrency(row.total_amount, row.currency || "INR")}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-brand-700 hover:underline"
            onClick={() => {
              setSelectedInvoice(row);
              setShowForm(true);
            }}
          >
            Edit
          </button>
          <button type="button" className="text-sm font-semibold text-rose-600 hover:underline" onClick={() => onDelete(row.id)}>
            Delete
          </button>
          <button type="button" className="text-sm font-semibold text-slate-700 hover:underline" onClick={() => onDownloadPdf(row)}>
            PDF
          </button>
        </div>
      ),
    },
  ];

  const totalBilled = useMemo(
    () => invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0),
    [invoices]
  );
  const paidCount = useMemo(() => invoices.filter((invoice) => invoice.status === "paid").length, [invoices]);
  const overdueCount = useMemo(() => invoices.filter((invoice) => invoice.status === "overdue").length, [invoices]);
  const openCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === "draft" || invoice.status === "sent").length,
    [invoices]
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.25),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.22),_transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Revenue workflow</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
              Manage invoice creation, follow-up, and payment status with more confidence.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Search the ledger, keep billing status current, and export PDFs without leaving the workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                onClick={() => {
                  setSelectedInvoice(null);
                  setShowForm((prev) => !prev);
                }}
              >
                {showForm ? "Close Invoice Form" : "Create Invoice"}
              </button>
              <Link
                to="/expenses"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open expenses
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Total billed</p>
              <p className="mt-3 text-3xl font-semibold">{formatCurrency(totalBilled)}</p>
              <p className="mt-2 text-sm text-slate-300">Value of invoices visible in the current view.</p>
            </div>
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">Paid</p>
              <p className="mt-3 text-3xl font-semibold">{paidCount}</p>
              <p className="mt-2 text-sm text-emerald-50/80">Invoices already marked as completed payments.</p>
            </div>
            <div className="rounded-3xl border border-orange-400/20 bg-orange-400/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100">Needs attention</p>
              <p className="mt-3 text-3xl font-semibold">{overdueCount + openCount}</p>
              <p className="mt-2 text-sm text-orange-50/80">Draft, sent, or overdue invoices still in motion.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Visible invoices</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{invoices.length}</p>
          <p className="mt-2 text-sm text-slate-500">Current rows matching the active search and status filters.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Paid</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">{paidCount}</p>
          <p className="mt-2 text-sm text-slate-500">Completed invoice records in this list.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Overdue</p>
          <p className="mt-3 text-3xl font-semibold text-rose-600">{overdueCount}</p>
          <p className="mt-2 text-sm text-slate-500">Invoices that still need collection attention.</p>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Filters</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Refine the invoice ledger</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search by client or invoice number and focus on the statuses that matter right now.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="block min-w-52">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Search</span>
              <input
                className="input"
                placeholder="Client or invoice..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </label>
            <label className="block min-w-40">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>
            <button type="button" className="btn-secondary" onClick={() => setFilters({ search: "", status: "" })}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {showForm ? (
        <InvoiceForm
          initialValues={selectedInvoice}
          onSubmit={onSave}
          submitting={submitting}
          onCancel={() => {
            setSelectedInvoice(null);
            setShowForm(false);
          }}
        />
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Invoice ledger</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Recent billing activity</h2>
          </div>
          <div className="surface-card px-4 py-3 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{invoices.length}</span> invoice
            {invoices.length === 1 ? "" : "s"} in the current view
          </div>
        </div>

        {loading ? (
          <Loader text="Loading invoices..." />
        ) : invoices.length ? (
          <Table columns={columns} rows={invoices} rowKey="id" />
        ) : (
          <EmptyState title="No invoices yet" message="Create your first invoice to start tracking income." />
        )}
      </section>
    </div>
  );
}
