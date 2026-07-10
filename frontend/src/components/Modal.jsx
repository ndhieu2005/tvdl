import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-3xl max-h-[90vh] overflow-y-auto' : 'max-w-md'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-blue">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-blue"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
