const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
    <div className="glass w-full max-w-xl rounded-2xl p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {/* <button
          onClick={onClose}
          className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
        >
          Tutup
        </button> */}
      </div>
      {children}
    </div>
  </div>
);

export default Modal;


