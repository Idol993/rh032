import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Ban,
  CheckCircle,
  Users,
  Briefcase,
  UserCheck,
  Crown,
  ChevronLeft, 
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { User, UserRole } from '@/types';
import { userService } from '@/services/userService';
import { ROLE_MAP } from '@/constants';
import { cn } from '@/utils';

const STATUS_MAP: Record<'active' | 'inactive', { label: string; color: string }> = {
  active: { label: '正常', color: 'badge-success' },
  inactive: { label: '禁用', color: 'badge-danger' },
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [keyword, setKeyword] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    lawyer: 0,
    assistant: 0,
    partner: 0,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getUsers({
        page,
        pageSize,
        role: roleFilter || undefined,
        keyword: keyword || undefined,
      });
      
      let filteredList = result.list;
      if (statusFilter) {
        filteredList = filteredList.filter(u => u.status === statusFilter);
      }
      
      setUsers(filteredList);
      setTotal(result.total);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await userService.getUsers();
      const allUsers = result.list;
      setStats({
        total: allUsers.length,
        lawyer: allUsers.filter(u => u.role === 'lawyer').length,
        assistant: allUsers.filter(u => u.role === 'assistant').length,
        partner: allUsers.filter(u => u.role === 'partner').length,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setRoleFilter('');
    setStatusFilter('');
    setKeyword('');
    setPage(1);
  };

  const handleView = (id: string) => {
    console.log('查看用户:', id);
  };

  const handleEdit = (id: string) => {
    console.log('编辑用户:', id);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await userService.update(user.id, { status: newStatus });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('更新用户状态失败:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该用户吗？')) {
      try {
        await userService.delete(id);
        fetchUsers();
        fetchStats();
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

  const handleNew = () => {
    console.log('新增用户');
  };

  const totalPages = Math.ceil(total / pageSize);

  const getBadgeClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'badge-primary': 'badge badge-primary',
      'badge-success': 'badge badge-success',
      'badge-warning': 'badge badge-warning',
      'badge-danger': 'badge badge-danger',
      'badge-neutral': 'badge badge-neutral',
    };
    return colorMap[color] || 'badge badge-neutral';
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const statCards = [
    { label: '总用户数', value: stats.total, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: '执业律师', value: stats.lawyer, icon: Briefcase, color: 'text-success-500', bg: 'bg-success-50' },
    { label: '律师助理', value: stats.assistant, icon: UserCheck, color: 'text-warning-500', bg: 'bg-warning-50' },
    { label: '合伙人', value: stats.partner, icon: Crown, color: 'text-accent-500', bg: 'bg-accent-50' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">用户管理</h1>
          <p className="text-sm text-neutral-500 mt-1">管理律所用户信息，支持角色分配和状态管理</p>
        </div>
        <button
          onClick={handleNew}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增用户
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">用户角色</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="select-field"
            >
              <option value="">全部角色</option>
              {Object.entries(ROLE_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">用户状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | '')}
              className="select-field"
            >
              <option value="">全部状态</option>
              <option value="active">正常</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-text">关键词搜索</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="输入姓名或手机号搜索"
                  className="input-field pl-10"
                />
              </div>
              <button onClick={handleSearch} className="btn-primary">
                搜索
              </button>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-1">
                <RefreshCw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500">
            共 <span className="font-medium text-primary-600">{total}</span> 条记录
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">姓名</th>
                <th className="px-4 py-3 text-left font-medium">角色</th>
                <th className="px-4 py-3 text-left font-medium">部门</th>
                <th className="px-4 py-3 text-left font-medium">执业证号</th>
                <th className="px-4 py-3 text-left font-medium">手机号</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
                <th className="px-4 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-neutral-300" />
                      <span>暂无用户数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-neutral-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={cn(getBadgeClass(ROLE_MAP[user.role].color))}>
                        {ROLE_MAP[user.role].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      {user.department || <span className="text-neutral-400">未设置</span>}
                    </td>
                    <td className="table-cell">
                      {user.licenseNo || <span className="text-neutral-400">暂无</span>}
                    </td>
                    <td className="table-cell">
                      {user.phone}
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(getBadgeClass(STATUS_MAP[user.status].color))}>
                        {STATUS_MAP[user.status].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(user.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            user.status === 'active'
                              ? "text-warning-500 hover:text-warning-600 hover:bg-warning-50"
                              : "text-success-500 hover:text-success-600 hover:bg-success-50"
                          )}
                          title={user.status === 'active' ? '禁用' : '启用'}
                        >
                          {user.status === 'active' ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-neutral-500 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-500">
              第 {page} / {totalPages} 页，共 {total} 条记录
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  page === 1 
                    ? "text-neutral-300 cursor-not-allowed" 
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {renderPagination().map((p, index) => (
                <button
                  key={index}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  disabled={p === '...'}
                  className={cn(
                    "min-w-8 h-8 px-2 rounded-md text-sm transition-colors",
                    p === page
                      ? "bg-primary-500 text-white font-medium"
                      : p === '...'
                        ? "text-neutral-400 cursor-default"
                        : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {p}
                </button>
              ))}
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  page === totalPages 
                    ? "text-neutral-300 cursor-not-allowed" 
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
