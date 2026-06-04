export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
          </div>
          
          {/* Featured Image */}
          <div className="h-64 md:h-96 bg-gray-200 rounded-xl mt-8"></div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="flex space-x-2">
            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-18 h-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}