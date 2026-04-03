import { useEffect, useState } from "react";

import { Button } from "../common/Button";
import { DatePicker } from "../common/DatePicker";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

const categories = ["Office", "Travel", "Software", "Utilities", "Other"];

const defaultState = {
  title: "",
  amount: "",
  category: "Office",
  expense_date: "",
  notes: "",
};

export function ExpenseForm({ initialValues, onSubmit, submitting, onCancel }) {
  const [values, setValues] = useState(defaultState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title || "",
        amount: initialValues.amount || "",
        category: initialValues.category || "Office",
        expense_date: initialValues.expense_date || "",
        notes: initialValues.notes || "",
      });
    } else {
      setValues(defaultState);
    }
  }, [initialValues]);

  const validate = () => {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "Title is required.";
    if (!values.amount || Number(values.amount) <= 0) nextErrors.amount = "Amount must be greater than 0.";
    if (!values.expense_date) nextErrors.expense_date = "Expense date is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({ ...values, amount: Number(values.amount).toFixed(2) });
  };

  return (
    <form className="card space-y-6 p-6 sm:p-7" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Expense form</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {initialValues ? "Update expense details" : "Record a new expense"}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Capture what was spent, where it belongs, and any notes your team will need later.
          </p>
        </div>
        <div className="surface-card px-4 py-3 text-sm text-slate-500">
          Every saved expense feeds the dashboard profit view automatically.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Title"
          value={values.title}
          error={errors.title}
          onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
        />
        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={values.amount}
          error={errors.amount}
          onChange={(e) => setValues((prev) => ({ ...prev, amount: e.target.value }))}
        />
        <Select
          label="Category"
          value={values.category}
          onChange={(e) => setValues((prev) => ({ ...prev, category: e.target.value }))}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <DatePicker
          label="Expense Date"
          value={values.expense_date}
          error={errors.expense_date}
          onChange={(e) => setValues((prev) => ({ ...prev, expense_date: e.target.value }))}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Notes</span>
        <textarea
          className="input min-h-[140px] resize-y"
          placeholder="Add vendor details, approval notes, or context for future review."
          value={values.notes}
          onChange={(e) => setValues((prev) => ({ ...prev, notes: e.target.value }))}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Expense"}
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
