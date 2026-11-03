import { Toaster as SonnerToaster } from 'sonner'

export const Toaster = () => {
  return (
    <SonnerToaster
      position="top-right"
      theme="light"
      closeButton
      offset={20}
      gap={10}
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: "'Inter', sans-serif",
          borderRadius: '14px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          background: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          padding: '14px 16px',
        },
        classNames: {
          toast: 'group toast border border-slate-200/90 bg-white text-slate-900 shadow-xl shadow-slate-900/5 rounded-2xl',
          title: 'text-sm font-semibold text-slate-900',
          description: 'text-xs text-slate-500 mt-0.5',
          actionButton: 'bg-indigo-600 text-white rounded-lg text-xs font-semibold px-3 py-1.5 hover:bg-indigo-700 transition',
          cancelButton: 'bg-slate-100 text-slate-700 rounded-lg text-xs font-medium px-3 py-1.5 hover:bg-slate-200 transition',
          closeButton: '!bg-white !border-slate-200 !text-slate-400 hover:!text-slate-900 rounded-full transition shadow-xs',
          success: '!border-emerald-200/80 !text-slate-900',
          error: '!border-rose-200/80 !text-slate-900',
          info: '!border-indigo-200/80 !text-slate-900',
          warning: '!border-amber-200/80 !text-slate-900',
        },
      }}
    />
  )
}

export default Toaster

