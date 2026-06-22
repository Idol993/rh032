import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Wallet,
  ShieldAlert,
  Building2,
  Archive,
  BarChart3,
  Settings,
  ChevronDown,
  Scale,
} from 'lucide-react';
import { SIDEBAR_MENU } from '@/constants';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Wallet,
  ShieldAlert,
  Building2,
  Archive,
  BarChart3,
  Settings,
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useUserStore();
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['cases', 'risk']);

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filteredMenu = SIDEBAR_MENU.filter(item => {
    if (!currentUser) return false;
    return item.roles.includes(currentUser.role);
  });

  const isChildActive = (children?: { path: string }[]) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path);
  };

  return (
    <aside className="w-60 bg-white border-r border-neutral-200 h-screen flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-800 font-serif">律政云</h1>
            <p className="text-xs text-neutral-400">案件管理平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {filteredMenu.map(item => {
          const IconComponent = iconMap[item.icon];
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedKeys.includes(item.key);
          const isActive = location.pathname === item.path || isChildActive(item.children);

          return (
            <div key={item.key} className="mb-1">
              {hasChildren ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.key)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-200',
                      isActive
                        ? 'text-primary-600 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  {isExpanded && item.children && (
                    <div className="bg-neutral-50/50">
                      {item.children.map(child => (
                        <NavLink
                          key={child.key}
                          to={child.path}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center pl-12 pr-4 py-2 text-sm transition-colors duration-200',
                              isActive
                                ? 'text-primary-600 font-medium bg-primary-50/50 border-l-2 border-primary-500'
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200 mx-2 rounded-md',
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                    )
                  }
                >
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-700 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {currentUser.role === 'director'
                  ? '律所主任'
                  : currentUser.role === 'partner'
                  ? '合伙人'
                  : currentUser.role === 'lawyer'
                  ? '执业律师'
                  : currentUser.role === 'assistant'
                  ? '律师助理'
                  : '客户'}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
