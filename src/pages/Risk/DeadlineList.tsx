import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare,
  Calendar,
  FileText,
  Bell,
  XCircle,
} from 'lucide-react';
import { Deadline, DeadlineLevel, DeadlineType } from '@/types';
import { deadlineService } from '@/services/deadlineService';
import { DEADLINE_LEVEL_MAP, DEADLINE_TYPE_MAP } from '@/constants';
import { formatDate, cn } from '@/utils';

const DeadlineList: React.FC = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [levelFilter, setLevelFilter] = useState<DeadlineLevel | ''>('');
  const [typeFilter, setTypeFilter] = useState<DeadlineType | ''>('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | ''>('');
  const [keyword, setKeyword] = useState('');

  const [statistics, setStatistics] = useState({
    total: 0,
    normal: 0,
    warning: 0,
    urgent: 0,
    overdue: 0,
  });

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await deadlineService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    try {
      const result = await deadlineService.getDeadlines({
        page,
        pageSize,
        level: levelFilter || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });

      let filteredList = result.list;
      if (keyword) {
        const keywordLower = keyword.toLowerCase();
        filteredList = filteredList.filter(
          (d) =>
            d.name.toLowerCase().includes(keywordLower) ||
            d.caseName.toLowerCase().includes(keywordLower)
        );
      }

      setDeadlines(filteredList);
      setTotal(result.total);
    } catch (error) {
      console.error('获取时限列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, levelFilter, typeFilter, statusFilter, keyword]);

  useEffect(() => {
    fetchStatistics();
    fetchDeadlines();
  }, [fetchStatistics, fetchDeadlines]);

  const handleSearch = () => {
    setPage(1);
    fetchDeadlines();
  };

  const handleReset = () => {
    setLevelFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setKeyword('');
    setPage(1);
  };

  const handleComplete = async (id: string) => {
    try {
      await deadlineService.complete(id);
      fetchStatistics();
      fetchDeadlines();
    } catch (error) {
      console.error('标记完成失败:', error);
    }
  };

  const handleView = (id: string) => {
    console.log('查看详情:', id);
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

  const getRemainingDaysClass = (level: DeadlineLevel, status: string) => {
    if (status === 'completed') return 'text-neutral-400';
    switch (level) {
      case 'overdue':
        return 'text-danger-600 font-bold';
      case 'urgent':
        return 'text-danger-500 font-semibold';
      case 'warning':
        return 'text-warning-600 font-medium';
      default:
        return 'text-success-600';
    }
  };

  const getRowClass = (level: DeadlineLevel, status: string) => {
    if (status === 'completed') return 'bg-neutral-50 opacity-60';
    if (level === 'overdue') return 'bg-danger-50/50';
    if (level === 'urgent') return 'bg-danger-50/30';
    if (level === 'warning') return 'bg-warning-50/30';
    return 'hover:bg-neutral-50';
  };

  const getStatusBadge = (status: string) => {
    return status === 'completed'
      ? { label: '已完成', color: 'badge-success' }
      : { label: '待处理', color: 'badge-warning' };
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

  const LevelIcon = ({ level }: { level: DeadlineLevel }) => {
    switch (level) {
      case 'overdue':
        return <XCircle className="w-4 h-4" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const statCards = [
    {
      key: 'total',
      label: '全部时限',
      value: statistics.total,
      icon: <Clock className="w-5 h-5" />,
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      iconBg: 'bg-primary-500',
    },
    {
      key: 'normal',
      label: '正常',
      value: statistics.normal,
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      iconBg: 'bg-success-500',
    },
    {
      key: 'warning',
      label: '预警',
      value: statistics.warning,
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600',
      iconBg: 'bg-warning-500',
    },
    {
      key: 'urgent',
      label: '紧急',
      value: statistics.urgent,
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-danger-50',
      textColor: 'text-danger-600',
      iconBg: 'bg-danger-500',
      pulse: true,
    },
    {
      key: 'overdue',
      label: '已逾期',
      value: statistics.overdue,
      icon: <XCircle className="w-5 h-5" />,
      bgColor: 'bg-danger-100/50',
      textColor: 'text-danger-700',
      iconBg: 'bg-danger-600',
      pulse: true,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="page-title">时限监控</h1>
        <p className="text-sm text-neutral-500 mt-1">
          实时监控案件诉讼时效、举证期限等重要时限，预警风险，避免逾期
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            className={cn(
              'stat-card relative overflow-hidden',
              stat.bgColor
            )}
          >
            {stat.pulse && stat.value > 0 && (
              <div
                className={cn(
                  'absolute top-4 right-4 w-2 h-2 rounded-full',
                  stat.iconBg
                )}
                style={{
                  animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            )}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className={cn('text-3xl font-bold mt-2 font-mono', stat.textColor)}>
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  'p-2.5 rounded-lg text-white',
                  stat.iconBg
                )}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">预警级别</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as DeadlineLevel | '')}
              className="select-field"
            >
              <option value="">全部级别</option>
              {Object.entries(DEADLINE_LEVEL_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">时限类型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as DeadlineType | '')}
              className="select-field"
            >
              <option value="">全部类型</option>
              {Object.entries(DEADLINE_TYPE_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'pending' | 'completed' | '')}
              className="select-field"
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          <div>
            <label className="label-text">关键词搜索</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="输入时限名称或案件名称搜索"
                  className="input-field pl-10"
                />
              </div>
              <button onClick={handleSearch} className="btn-primary">
                搜索
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-500">
            共 <span className="font-medium text-primary-600">{total}</span> 条记录
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Bell className="w-3.5 h-3.5" />
            <span>按剩余天数升序排列</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">时限名称</th>
                <th className="px-4 py-3 text-left font-medium">所属案件</th>
                <th className="px-4 py-3 text-left font-medium">时限类型</th>
                <th className="px-4 py-3 text-left font-medium">截止日期</th>
                <th className="px-4 py-3 text-center font-medium">剩余天数</th>
                <th className="px-4 py-3 text-center font-medium">预警级别</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
                <th className="px-4 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : deadlines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-12 h-12 text-neutral-300" />
                      <span>暂无时限数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                deadlines.map((deadline) => (
                  <tr
                    key={deadline.id}
                    className={cn(
                      'transition-colors duration-200',
                      getRowClass(deadline.level, deadline.status),
                      deadline.status !== 'completed' && deadline.level === 'overdue' && 'animate-pulse-slow'
                    )}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-500" />
                        <span className="font-medium text-neutral-700 max-w-xs truncate">
                          {deadline.name}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-600 max-w-xs truncate">
                        {deadline.caseName}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-600">
                        {DEADLINE_TYPE_MAP[deadline.type]}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono text-neutral-600">
                          {formatDate(deadline.deadline)}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={cn(
                            getRemainingDaysClass(deadline.level, deadline.status)
                          )}
                        >
                          {deadline.status === 'completed'
                            ? '已完成'
                            : deadline.remainingDays > 0
                            ? `${deadline.remainingDays} 天`
                            : deadline.remainingDays === 0
                            ? '今天到期'
                            : `逾期 ${Math.abs(deadline.remainingDays)} 天`}
                        </span>
                        {deadline.status !== 'completed' &&
                          deadline.level !== 'normal' && (
                            <span
                              className={cn(
                                getRemainingDaysClass(deadline.level, deadline.status)
                              )}
                            >
                              <LevelIcon level={deadline.level} />
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span
                        className={cn(
                          getBadgeClass(DEADLINE_LEVEL_MAP[deadline.level].color)
                        )}
                      >
                        {DEADLINE_LEVEL_MAP[deadline.level].label}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(getBadgeClass(getStatusBadge(deadline.status).color))}>
                        {getStatusBadge(deadline.status).label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {deadline.status === 'pending' && (
                          <button
                            onClick={() => handleComplete(deadline.id)}
                            className="p-1.5 text-success-600 hover:text-success-700 hover:bg-success-50 rounded-md transition-colors"
                            title="标记完成"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleView(deadline.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  page === 1
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-600 hover:bg-neutral-100'
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
                    'min-w-8 h-8 px-2 rounded-md text-sm transition-colors',
                    p === page
                      ? 'bg-primary-500 text-white font-medium'
                      : p === '...'
                      ? 'text-neutral-400 cursor-default'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  page === totalPages
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-600 hover:bg-neutral-100'
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

export default DeadlineList;
