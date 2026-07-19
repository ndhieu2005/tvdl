const INPUT_CLS = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue outline-none';

export function FormField({ label, required = false, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-blue uppercase tracking-wide mb-1">
        {label}{required && ' *'}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function TextInput(props) {
  return <input {...props} className={`${INPUT_CLS} ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
  return <select {...props} className={`${INPUT_CLS} ${props.className || ''}`}>{children}</select>;
}

export function TextArea(props) {
  return <textarea rows={3} {...props} className={`${INPUT_CLS} resize-none ${props.className || ''}`} />;
}
