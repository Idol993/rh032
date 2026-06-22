import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { ROLE_MAP } from '@/constants';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索案件、客户、文书..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-700">消息通知</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                  <p className="text-sm text-neutral-700">案件举证期限即将到期</p>
                  <p className="text-xs text-neutral-400 mt-1">北京宏达科技有限公司买卖合同纠纷 - 还有2天</p>
                </div>
                <div className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                  <p className="text-sm text-neutral-700">新风险工单待处理</p>
                  <p className="text-xs text-neutral-400 mt-1">李娜劳动争议案 - 上诉期已超期</p>
                </div>
                <div className="px-4 py-3 hover:bg-neutral-50 cursor-pointer">
                  <p className="text-sm text-neutral-700">文书审批通过</p>
                  <p className="text-xs text-neutral-400 mt-1">民事起诉状 - 王律师提交</p>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-neutral-200 text-center">
                <button className="text-sm text-primary-500 hover:text-primary-600">
                  查看全部
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {currentUser?.name.charAt(0)}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-700">{currentUser?.name}</p>
              <p className="text-xs text-neutral-400">
                {currentUser ? ROLE_MAP[currentUser.role].label : ''}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 overflow-hidden">
              <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-600 hover:bg-neutral-50 flex items-center gap-3">
                <User className="w-4 h-4" />
                个人中心
              </button>
              <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-600 hover:bg-neutral-50 flex items-center gap-3">
                <Settings className="w-4 h-4" />
                系统设置
              </button>
              <div className="h-px bg-neutral-200"></div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-danger-500 hover:bg-danger-50 flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
