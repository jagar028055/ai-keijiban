export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Skeleton */}
      <div className="mb-12 text-center">
        <div className="h-12 sm:h-14 bg-gray-200 dark:bg-gray-800 rounded-xl w-64 mx-auto mb-4 skeleton" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-80 mx-auto skeleton" />
      </div>

      {/* News Cards Skeleton */}
      <div className="grid gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 shadow-soft"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-full w-20 skeleton" />
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-28 skeleton" />
            </div>

            <div className="h-7 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-full mb-2 skeleton" />
            <div className="h-7 sm:h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4 mb-5 skeleton" />

            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-full mb-2 skeleton" />
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-2/3 mb-6 skeleton" />

            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-28 skeleton" />
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-24 skeleton" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-12 flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl skeleton"
          />
        ))}
      </div>
    </div>
  );
}
