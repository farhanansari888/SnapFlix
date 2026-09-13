"use client";

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="min-h-screen w-full">{children}</div>;
};

export default Sidebar;
