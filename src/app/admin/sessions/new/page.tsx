'use client';

export default function NewSessionPage() {
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-instrument-serif text-3xl font-bold mb-2">Create New Session</h1>
          <p className="text-gray-400">Add a new Spark 101 session</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="font-instrument-serif text-2xl font-medium mb-2">Coming Soon</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Session creation form will be available here. For now, add sessions directly in Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}