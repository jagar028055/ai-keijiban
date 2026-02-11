export default function NewsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation Skeleton */}
      <div className="mb-8">
        <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl w-36 skeleton" />
      </div>

      {/* Article Skeleton */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-gray-200/50 dark:border-white/10 shadow-card mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-24 skeleton" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-36 skeleton" />
        </div>

        <div className="h-10 sm:h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-full mb-2 skeleton" />
        <div className="h-10 sm:h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4 mb-6 skeleton" />

        <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg skeleton" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-28 skeleton" />
        </div>

        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-full skeleton" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-full skeleton" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-5/6 skeleton" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-full skeleton" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-4/5 skeleton" />
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-36 skeleton" />
        </div>
      </div>

      {/* Comments Section Skeleton */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-gray-200/50 dark:border-white/10 shadow-card">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-gray-100 dark:border-white/5">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl skeleton" />
          <div>
            <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-xl w-40 mb-2 skeleton" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-24 skeleton" />
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-white/5">
              <div className="flex-shrink-0 w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl skeleton" />
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-24 skeleton" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 skeleton" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-12 skeleton" />
                </div>
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-full skeleton" />
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-5/6 skeleton" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-24 skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
