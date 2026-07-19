import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [prompt, setPrompt] = useState(null); // { message }
  const resolver = useRef(null);

  const confirm = useCallback((message) => {
    setPrompt({ message });
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  function answer(value) {
    setPrompt(null);
    resolver.current?.(value);
    resolver.current = null;
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {prompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-yellow-dark" />
              </div>
              <p className="text-sm text-dark font-medium pt-1.5">{prompt.message}</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => answer(false)}
                className="px-4 py-2 text-sm text-muted hover:text-blue font-medium"
              >
                Huỷ
              </button>
              <button
                onClick={() => answer(true)}
                className="bg-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-light"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context file: provider + hook đi cùng nhau
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm phải dùng bên trong <ConfirmProvider>');
  return ctx;
}
