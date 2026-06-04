import React from 'react';

export default function AdminUnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-auth-layout">
      {children}
    </div>
  );
}