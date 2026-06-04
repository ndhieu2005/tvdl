'use client';

import React, { useState } from 'react';

export default function SimpleInput() {
  const [value, setValue] = useState('');

  return (
    <div className="p-4 border rounded">
      <h3 className="mb-2">Test Input (Hoàn toàn đơn giản)</h3>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nhập text ở đây..."
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
      />
      <p className="mt-2 text-sm text-gray-600">Value: {value}</p>
    </div>
  );
}