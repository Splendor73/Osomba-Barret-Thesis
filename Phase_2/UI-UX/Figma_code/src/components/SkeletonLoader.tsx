export function QuestionCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
      <div className="mb-3">
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="mb-2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-5 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function ThreadTableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-12 px-6 py-3"></th>
            <th className="w-12 px-6 py-3"></th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Author</th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Posted</th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Views</th>
            <th className="w-12 px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="border-b border-gray-100 animate-pulse">
              <td className="px-6 py-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-8 bg-gray-200 rounded"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
