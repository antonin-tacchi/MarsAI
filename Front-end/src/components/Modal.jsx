export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#262335]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#FBF5F0] w-full max-w-md rounded-[2.5rem] shadow-2xl transform transition-all overflow-hidden border border-[#262335]/10 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-[#262335] tracking-tighter uppercase">
            {title}
          </h2>
        </div>
        <div className="text-[#262335]/80 mb-8">{children}</div>
      </div>
    </div>
  );
}
