export const Modal = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative z-10"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative text-white bg-gray-900 transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
);
