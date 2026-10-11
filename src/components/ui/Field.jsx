import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4";
const okStyle = "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15";
const badStyle = "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15";

function Field({ label, htmlFor, error, required, children, action }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
        </label>
        {action}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function Input({
  label,
  error,
  required,
  className,
  id,
  right,
  action,
  ...props
}) {
  const inputId = id ?? props.name;
  return (
    <Field label={label} htmlFor={inputId} error={error} required={required} action={action}>
      <div className="relative">
        <input
          id={inputId}
          required={required}
          className={cn(
            control,
            error ? badStyle : okStyle,
            right ? "pr-11" : "",
            className
          )}
          {...props}
        />
        {right && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {right}
          </div>
        )}
      </div>
    </Field>
  );
}

export function Select({
  label,
  error,
  required,
  className,
  id,
  children,
  action,
  ...props
}) {
  const selectId = id ?? props.name;
  return (
    <Field label={label} htmlFor={selectId} error={error} required={required} action={action}>
      <select
        id={selectId}
        required={required}
        className={cn(control, error ? badStyle : okStyle, className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

export function Textarea({ label, error, required, className, id, action, ...props }) {
  const areaId = id ?? props.name;
  return (
    <Field label={label} htmlFor={areaId} error={error} required={required} action={action}>
      <textarea
        id={areaId}
        required={required}
        rows={3}
        className={cn(control, error ? badStyle : okStyle, className)}
        {...props}
      />
    </Field>
  );
}