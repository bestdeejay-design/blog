'use client'

// Modal Component
export function Modal({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Stat Card Component
export function StatCard({ title, count, color, icon }: { title: string, count: number, color: string, icon: string }) {
  const colors: any = {
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600'
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-4xl font-bold ${colors[color]} mt-2`}>{count}</p>
        </div>
        <div className="text-5xl opacity-50">{icon}</div>
      </div>
    </div>
  )
}
