import React, { useEffect, useMemo, useState } from "react";

import { completeTaskStage } from "../services/taskService.js";

/** Reference form colors */
const C = {
  header: "bg-[#D9D9D9]",
  value: "bg-[#FFF2CC]",
  green: "bg-[#E2EFDA]",
  border: "border border-black",
  text: "text-black",
};

const CATEGORY_OPTIONS = [
  { value: "", label: "—" },
  { value: "EHS", label: "EHS" },
  { value: "G", label: "G" },
  { value: "M/R", label: "M/R" },
  { value: "PI", label: "PI" },
];

function emptyForm() {
  return {
    projectNumber: "",
    budgetedYear: "",
    category: "",
    plantNameAndNumber: "",
    submitter: "",
    budgetedItemYesNo: "",
    origBudgetAmount: "",
    itemToBeLeasedYesNo: "",
    requestedAmount: "",
    requestedVsBudgetNote: "",
    newAssetDescription: "",
    oldAssetDescription: "",
    economicJustification: "",
    quotationCount: "",
    supplierSelectionCriteria: "",
    soleSource: "",
    supplier1: "",
    supplier2: "",
    supplier3: "",
    supplierQuotationsNotes: "",
    otherItemsOfNote: "",
    totalSpend: "",
    afterTaxCashPaybackYears: "",
    npv: "",
    ebitdaY1: "",
    ebitdaY2: "",
    ebitdaY3: "",
    irr: "",
    startDate: "",
    endDate: "",
    ownerOfProject: "",
    specialist: "",
    outsideResources: "",
    requestorSig: "",
    requestorPrint: "",
    requestorDate: "",
    managerSig: "",
    managerPrint: "",
    managerDate: "",
    dirProcSig: "",
    dirProcPrint: "",
    dirProcDate: "",
    vpSupplySig: "",
    vpSupplyPrint: "",
    vpSupplyDate: "",
    controllerSig: "",
    controllerPrint: "",
    controllerDate: "",
    cooSig: "",
    cooPrint: "",
    cooDate: "",
    cfoSig: "",
    cfoPrint: "",
    cfoDate: "",
    ceoSig: "",
    ceoPrint: "",
    ceoDate: "",
  };
}

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function PeachInput(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full min-w-0 px-2 py-1.5 text-sm outline-none",
        C.value,
        C.border,
        C.text,
        props.className,
      )}
    />
  );
}

function PeachTextarea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-w-0 resize-y px-2 py-1.5 text-sm outline-none",
        C.value,
        C.border,
        C.text,
        props.className,
      )}
    />
  );
}

function GreenInput(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full min-w-0 px-2 py-1.5 text-sm outline-none",
        C.green,
        C.border,
        C.text,
        props.className,
      )}
    />
  );
}

function WhiteTextarea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-w-0 resize-y bg-white px-2 py-2 text-sm outline-none",
        C.border,
        C.text,
        props.className,
      )}
    />
  );
}

function YesNoRadios({ name, value, onChange, legend, boxed }) {
  const radioCls = "h-3.5 w-3.5 shrink-0 border-black text-black accent-black";
  const inner = (
    <div className="flex items-center gap-6" role="radiogroup" aria-label={legend || name}>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-normal">
        <input type="radio" name={name} value="Y" checked={value === "Y"} onChange={onChange} className={radioCls} />
        YES
      </label>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-normal">
        <input type="radio" name={name} value="N" checked={value === "N"} onChange={onChange} className={radioCls} />
        NO
      </label>
    </div>
  );
  if (boxed) {
    return <div className={cn("inline-flex px-3 py-1.5", C.value, C.border)}>{inner}</div>;
  }
  return inner;
}

function SectionBar({ children, className = "" }) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-bold", C.header, C.border, C.text, className)}>{children}</div>
  );
}

function ApprovalCell({ title, sig, print, date, form, set }) {
  return (
    <div className={cn("flex flex-col gap-1 p-2", C.border, "bg-white")}>
      <div className="text-xs font-bold">{title}</div>
      <div className="text-[10px] text-gray-600">Signature</div>
      <PeachInput value={form[sig]} onChange={set(sig)} className="font-serif italic" placeholder="" />
      <div className="text-[10px] text-gray-600">Print Name</div>
      <PeachInput value={form[print]} onChange={set(print)} />
      <div className="text-[10px] text-gray-600">Date</div>
      <PeachInput type="date" value={form[date]} onChange={set(date)} />
    </div>
  );
}

/**
 * Astro CAPEX form — Submit completes workflow stage for `taskId`.
 */
export default function CapexRequestForm({ formKey, taskId, defaultSubmitter = "", onStageCompleted }) {
  const initial = useMemo(() => {
    const base = emptyForm();
    if (defaultSubmitter) {
      base.submitter = defaultSubmitter;
      base.requestorPrint = defaultSubmitter;
    }
    return base;
  }, [formKey, defaultSubmitter]);

  const [form, setForm] = useState(initial);
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(() => {
      const base = emptyForm();
      if (defaultSubmitter) {
        base.submitter = defaultSubmitter;
        base.requestorPrint = defaultSubmitter;
      }
      return base;
    });
    setSubmitFeedback(null);
    setSubmitting(false);
  }, [formKey, defaultSubmitter]);

  const set =
    (key) =>
    (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const reset = () => {
    const base = emptyForm();
    if (defaultSubmitter) {
      base.submitter = defaultSubmitter;
      base.requestorPrint = defaultSubmitter;
    }
    setForm(base);
    setSubmitFeedback(null);
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = String(taskId ?? formKey ?? "").trim();
    if (!id) {
      setSubmitFeedback({ type: "error", message: "Missing task ID — cannot complete stage." });
      return;
    }
    setSubmitting(true);
    setSubmitFeedback(null);
    try {
      await completeTaskStage(id, {});
      setSubmitFeedback({
        type: "success",
        message: "Stage completed successfully. Your task list will refresh.",
      });
      if (typeof onStageCompleted === "function") {
        await onStageCompleted();
      }
    } catch (err) {
      setSubmitFeedback({
        type: "error",
        message: err?.message || "Could not complete stage. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const y = new Date().getFullYear();

  return (
    <form
      className={cn("capex-form space-y-3 font-sans", C.text)}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={cn("overflow-hidden bg-white shadow-md", C.border)}>
        {/* Header: logo + title */}
        <div className={cn("flex items-center justify-between gap-4 px-3 py-3", C.border, "border-b")}>
          <div className="shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}astro-shapes-logo.png`}
              alt="Astro Shapes"
              className="h-12 w-auto max-w-[min(100%,240px)] object-contain object-left md:h-14"
              width={240}
              height={60}
              decoding="async"
            />
          </div>
          <h1 className="flex-1 text-center text-xl font-bold tracking-tight md:text-2xl">Astro CAPEX Form</h1>
          <div className="hidden w-[120px] sm:block" aria-hidden />
        </div>

        {/* Project # | Budgeted Year */}
        <div className={cn("grid grid-cols-1 sm:grid-cols-4", C.border, "border-b")}>
          <div className={cn("flex items-center px-2 py-2 text-sm font-normal sm:col-span-1", C.border, "border-b sm:border-b-0 sm:border-r")}>
            Project # if available
          </div>
          <div className={cn("p-1.5 sm:col-span-1", C.border, "border-b sm:border-b-0 sm:border-r")}>
            <PeachInput value={form.projectNumber} onChange={set("projectNumber")} placeholder="" />
          </div>
          <div className={cn("flex items-center justify-center px-2 py-2 text-sm font-normal sm:col-span-1", C.border, "sm:border-r")}>
            Budgeted Year
          </div>
          <div className="p-1.5 sm:col-span-1">
            <PeachInput
              type="number"
              value={form.budgetedYear}
              onChange={set("budgetedYear")}
              placeholder={String(y)}
              min={2000}
              max={2100}
            />
          </div>
        </div>

        {/* Category */}
        <div className={cn("grid grid-cols-1 gap-0 sm:grid-cols-[auto_1fr]", C.border, "border-b")}>
          <div className={cn("px-2 py-2 text-sm font-bold underline sm:w-36", C.border, "sm:border-r")}>
            Category:
          </div>
          <div className="flex flex-col gap-1 p-2 sm:flex-row sm:items-start sm:gap-3">
            <select
              className={cn("w-full max-w-[120px] px-2 py-1.5 text-sm font-semibold sm:w-28", C.value, C.border)}
              value={form.category}
              onChange={set("category")}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value || "e"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs leading-snug">
              = Environmental/Health/Safety (&quot;<span className="font-semibold text-red-600">EHS</span>&quot;),{" "}
              <span className="font-semibold text-red-600">Growth</span> (&quot;
              <span className="font-semibold text-red-600">G</span>&quot;), Maintenance/Replacement (&quot;
              <span className="font-semibold text-red-600">M/R</span>&quot;), Process Improvement (&quot;
              <span className="font-semibold text-red-600">PI</span>&quot;)
            </p>
          </div>
        </div>

        {/* Plant | Submitter */}
        <div className={cn("grid grid-cols-1 sm:grid-cols-4", C.border, "border-b")}>
          <div className={cn("px-2 py-2 text-sm sm:col-span-1", C.border, "border-b sm:border-b-0 sm:border-r")}>
            Plant Name &amp; Number
          </div>
          <div className={cn("p-1.5 sm:col-span-1", C.border, "border-b sm:border-b-0 sm:border-r")}>
            <PeachInput value={form.plantNameAndNumber} onChange={set("plantNameAndNumber")} />
          </div>
          <div className={cn("px-2 py-2 text-sm font-semibold sm:col-span-1", C.border, "sm:border-r")}>Submitter:</div>
          <div className="p-1.5 sm:col-span-1">
            <PeachInput value={form.submitter} onChange={set("submitter")} autoComplete="name" />
          </div>
        </div>

        {/* Budgeted item Y/N | Orig budget | Item leased Y/N */}
        <div className={cn("grid grid-cols-1 lg:grid-cols-12", C.border, "border-b")}>
          <div className={cn("flex flex-col justify-center gap-2 px-2 py-2 lg:col-span-3", C.border, "border-b lg:border-b-0 lg:border-r")}>
            <span className="text-sm font-semibold">Budgeted Item:</span>
            <YesNoRadios
              boxed
              name={`capex-${formKey}-bud-yn`}
              legend="Budgeted item"
              value={form.budgetedItemYesNo}
              onChange={set("budgetedItemYesNo")}
            />
          </div>
          <div className={cn("lg:col-span-4", C.border, "border-b lg:border-b-0 lg:border-r")}>
            <div className="px-2 py-1 text-sm">Orig. Budget Amount</div>
            <div className="p-1.5">
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm">$</span>
                <PeachInput
                  type="number"
                  className="pl-6"
                  value={form.origBudgetAmount}
                  onChange={set("origBudgetAmount")}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className={cn("flex flex-col justify-center gap-2 px-2 py-2 lg:col-span-3", C.border, "border-b lg:border-b-0 lg:border-r")}>
            <span className="text-sm font-semibold">Item To Be Leased</span>
            <YesNoRadios
              boxed
              name={`capex-${formKey}-lease-yn`}
              legend="Item to be leased"
              value={form.itemToBeLeasedYesNo}
              onChange={set("itemToBeLeasedYesNo")}
            />
          </div>
          <div className="flex flex-col justify-center px-2 py-2 lg:col-span-2">
            <span className="text-sm">Requested vs. Budget Amount:</span>
            <PeachInput className="mt-1" value={form.requestedVsBudgetNote} onChange={set("requestedVsBudgetNote")} placeholder="" />
          </div>
        </div>

        {/* Requested amount full width */}
        <div className={cn("grid grid-cols-1 sm:grid-cols-4", C.border, "border-b")}>
          <div className={cn("px-2 py-2 text-sm sm:col-span-1", C.border, "border-b sm:border-b-0 sm:border-r")}>
            Requested Amount
          </div>
          <div className="p-1.5 sm:col-span-3">
            <div className="relative max-w-md">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm">$</span>
              <PeachInput
                type="number"
                className="pl-6"
                value={form.requestedAmount}
                onChange={set("requestedAmount")}
                min={0}
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* New | Old asset — two columns */}
        <div className={cn("grid grid-cols-1 md:grid-cols-2", C.border, "border-b")}>
          <div className={cn("flex flex-col", C.border, "border-b md:border-b-0 md:border-r")}>
            <SectionBar>New Asset Description*</SectionBar>
            <div className="min-h-[120px] flex-1 p-1">
              <WhiteTextarea rows={6} value={form.newAssetDescription} onChange={set("newAssetDescription")} className="h-full min-h-[112px]" />
            </div>
          </div>
          <div className="flex flex-col">
            <SectionBar>Old Asset Description and Asset # to be replaced, when applicable</SectionBar>
            <div className="min-h-[120px] flex-1 p-1">
              <WhiteTextarea rows={6} value={form.oldAssetDescription} onChange={set("oldAssetDescription")} className="h-full min-h-[112px]" />
            </div>
          </div>
        </div>

        {/* Economic justification */}
        <div className={cn(C.border, "border-b")}>
          <SectionBar>Economic justification for request</SectionBar>
          <div className={cn("px-2 py-1 text-xs italic", C.header)} style={{ borderTop: "1px solid black" }}>
            e.g. Production capacity improvement, Cost savings, Labor savings, Preventative Maintenance, Is the new replacement unit an improvement?
            Why?
          </div>
          <div className="p-1.5">
            <WhiteTextarea rows={5} value={form.economicJustification} onChange={set("economicJustification")} />
          </div>
        </div>

        {/* Supplier quotations */}
        <div className={cn(C.border, "border-b")}>
          <SectionBar className="text-xs leading-tight sm:text-sm">
            Supplier Quotations (note how many quotations have been obtained, the selected supplier and rationale, such as quality, pricing,
            delivery/installation, etc.)
          </SectionBar>
          <div className={cn("grid grid-cols-1 gap-2 p-2 sm:grid-cols-3", C.border, "border-t")}>
            <div>
              <span className="text-xs font-semibold">Number of Quotations obtained:</span>
              <PeachInput type="number" className="mt-1" min={0} step={1} value={form.quotationCount} onChange={set("quotationCount")} />
            </div>
            <div>
              <span className="text-xs font-semibold">Supplier selection criteria:</span>
              <PeachInput className="mt-1" value={form.supplierSelectionCriteria} onChange={set("supplierSelectionCriteria")} />
            </div>
            <div>
              <span className="text-xs font-semibold">Sole Source (Y/N):</span>
              <div className="mt-1">
                <YesNoRadios name={`capex-${formKey}-sole`} legend="Sole source" value={form.soleSource} onChange={set("soleSource")} />
              </div>
            </div>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className={cn("grid grid-cols-1 sm:grid-cols-[140px_1fr]", C.border, "border-t")}>
              <div className={cn("flex items-center px-2 py-1 text-sm", C.border, "border-b sm:border-b-0 sm:border-r")}>
                Supplier #{n}:
              </div>
              <div className="p-1">
                <PeachInput value={form[`supplier${n}`]} onChange={set(`supplier${n}`)} />
              </div>
            </div>
          ))}
          <div className="p-1.5">
            <WhiteTextarea rows={3} value={form.supplierQuotationsNotes} onChange={set("supplierQuotationsNotes")} placeholder="Additional quotation notes" />
          </div>
        </div>

        {/* Other items */}
        <div className={cn(C.border, "border-b")}>
          <SectionBar>Other Items of Note</SectionBar>
          <div className="p-1.5">
            <WhiteTextarea rows={4} value={form.otherItemsOfNote} onChange={set("otherItemsOfNote")} />
          </div>
        </div>

        {/* FINANCIALS | Project timing */}
        <div className={cn("grid grid-cols-1 lg:grid-cols-2", C.border, "border-b")}>
          <div className={cn("flex flex-col", C.border, "border-b lg:border-b-0 lg:border-r")}>
            <SectionBar>FINANCIALS</SectionBar>
            <div className={cn("px-2 py-1 text-center text-xs font-semibold", C.header)} style={{ borderTop: "1px solid black" }}>
              Must complete for Improvements / Expansion / Growth
            </div>
            <div className="space-y-2 p-2">
              <div>
                <div className="text-sm font-semibold">TOTAL Spend</div>
                <div className="relative mt-0.5">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm">$</span>
                  <PeachInput type="number" className="pl-6" value={form.totalSpend} onChange={set("totalSpend")} min={0} step="0.01" />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[140px] flex-1">
                  <div className="text-sm font-semibold">After Tax Cash Payback (Yrs)</div>
                  <GreenInput className="mt-0.5" value={form.afterTaxCashPaybackYears} onChange={set("afterTaxCashPaybackYears")} />
                </div>
                <span className="pb-2 text-sm">years</span>
              </div>
              <div>
                <div className="text-sm font-semibold">NPV</div>
                <GreenInput className="mt-0.5 max-w-xs" value={form.npv} onChange={set("npv")} />
              </div>
              <table className={cn("w-full border-collapse text-sm", C.border)}>
                <thead>
                  <tr className={C.header}>
                    <th className={cn("border border-black px-2 py-1 font-bold underline")} colSpan={1} />
                    <th className={cn("border border-black px-2 py-1 text-center font-bold underline")}>EBITDA</th>
                    <th className={cn("border border-black px-2 py-1 text-center font-bold underline")}>IRR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={cn("border border-black px-2 py-1", C.value)}>{`Yr. 1 = ${y}`}</td>
                    <td className={cn("border border-black p-1")}>
                      <input
                        className={cn("w-full px-1 py-1 text-sm outline-none", C.value, C.border)}
                        value={form.ebitdaY1}
                        onChange={set("ebitdaY1")}
                      />
                    </td>
                    <td className={cn("border border-black p-1")} rowSpan={3}>
                      <GreenInput className="h-full min-h-[72px]" value={form.irr} onChange={set("irr")} placeholder="IRR" />
                    </td>
                  </tr>
                  <tr>
                    <td className={cn("border border-black px-2 py-1", C.value)}>{`Yr. 2 = ${y + 1}`}</td>
                    <td className={cn("border border-black p-1")}>
                      <input
                        className={cn("w-full px-1 py-1 text-sm outline-none", C.value, C.border)}
                        value={form.ebitdaY2}
                        onChange={set("ebitdaY2")}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className={cn("border border-black px-2 py-1", C.value)}>{`Yr. 3 = ${y + 2}`}</td>
                    <td className={cn("border border-black p-1")}>
                      <input
                        className={cn("w-full px-1 py-1 text-sm outline-none", C.value, C.border)}
                        value={form.ebitdaY3}
                        onChange={set("ebitdaY3")}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionBar>Project Timing</SectionBar>
            <div className="space-y-2 p-2">
              {[
                ["Start Date", "startDate"],
                ["End Date", "endDate"],
                ["Owner of Project", "ownerOfProject"],
                ["Specialist", "specialist"],
                ["Outside Resources", "outsideResources"],
              ].map(([label, key]) => (
                <div key={key}>
                  <div className="text-sm font-semibold">{label}</div>
                  {key === "startDate" || key === "endDate" ? (
                    <PeachInput type="date" className="mt-0.5" value={form[key]} onChange={set(key)} />
                  ) : (
                    <PeachInput className="mt-0.5" value={form[key]} onChange={set(key)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow approvals */}
        <div className={cn(C.border)}>
          <SectionBar className="text-xs leading-tight sm:text-sm">
            Workflow Approvals (Email Chain of Approvals); Refer to Delegation of Authority (DOA) as well
          </SectionBar>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
            <ApprovalCell
              title="Requestor"
              sig="requestorSig"
              print="requestorPrint"
              date="requestorDate"
              form={form}
              set={set}
            />
            <ApprovalCell
              title="Requestor's Manager"
              sig="managerSig"
              print="managerPrint"
              date="managerDate"
              form={form}
              set={set}
            />
            <ApprovalCell
              title="Dir. Procurement"
              sig="dirProcSig"
              print="dirProcPrint"
              date="dirProcDate"
              form={form}
              set={set}
            />
            <ApprovalCell
              title="VP Supply Chain"
              sig="vpSupplySig"
              print="vpSupplyPrint"
              date="vpSupplyDate"
              form={form}
              set={set}
            />
            <ApprovalCell
              title="Controller"
              sig="controllerSig"
              print="controllerPrint"
              date="controllerDate"
              form={form}
              set={set}
            />
            <ApprovalCell title="COO" sig="cooSig" print="cooPrint" date="cooDate" form={form} set={set} />
            <ApprovalCell title="CFO" sig="cfoSig" print="cfoPrint" date="cfoDate" form={form} set={set} />
            <ApprovalCell title="CEO" sig="ceoSig" print="ceoPrint" date="ceoDate" form={form} set={set} />
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500">Draft — values are stored locally in your browser until you leave this page.</p>

      {submitFeedback?.type === "success" ? (
        <div
          className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-center text-sm text-primary-900"
          role="status"
          aria-live="polite"
        >
          {submitFeedback.message}
        </div>
      ) : null}
      {submitFeedback?.type === "error" ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-900"
          role="alert"
          aria-live="assertive"
        >
          {submitFeedback.message}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="button" className="btn-secondary text-sm" onClick={reset} disabled={submitting}>
          Clear form
        </button>
        <button type="submit" className="btn-primary text-sm disabled:opacity-60" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
