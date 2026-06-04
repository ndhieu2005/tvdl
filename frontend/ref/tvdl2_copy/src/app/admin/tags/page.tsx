'use client';

import { useState } from 'react';
import { BarChart3, Tags, TrendingUp } from 'lucide-react';
import TagManager from '@/components/admin/TagManager';
import TagStats from '@/components/admin/TagStats';

export default function AdminTagsPage() {
  const [activeTab, setActiveTab] = useState<'manage' | 'stats'>('manage');

  const tabs = [
    {
      id: 'manage' as const,
      label: 'Quản lý Tags',
      icon: Tags,
      description: 'Tạo, chỉnh sửa và xóa tags',
    },
    {
      id: 'stats' as const,
      label: 'Thống kê',
      icon: BarChart3,
      description: 'Xem thống kê và phân tích tags',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Tags</h1>
        <p className="text-gray-600">
          Quản lý thẻ tags cho bài viết, theo dõi hiệu suất và thống kê sử dụng
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400 font-normal">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'manage' && <TagManager />}
          {activeTab === 'stats' && <TagStats />}
        </div>
      </div>
    </div>
  );
}
