import React from 'react';

const Loading = () => {
  return (
    <div className="text-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Đang tải dữ liệu</p>
    </div>
  )
}

export default Loading;