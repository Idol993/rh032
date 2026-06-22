import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  PlayCircle,
  XCircle,
  Plus,
  FileText,
  User,
  UserCheck,
  Clock,
  Flame,
} from 'lucide-react';
import { RiskTicket, RiskLevel, RiskStatus, RiskType } from '@/types';
import { riskTicketService } from '@/services/riskTicketService';
import { RISK_LEVEL_MAP, RISK_TYPE_MAP, RISK_STATUS_MAP } from '@/constants';
import { formatDateTime, cn } from '@/utils';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<RiskTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [levelFilter, setLevelFilter] = useState<RiskLevel | ''>('');
  const [statusFilter, setStatusFilter] = useState<RiskStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<RiskType | ''>('');
  const [keyword, setKeyword] = useState('');

  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    resolved: 0,
    high: 0,
    critical: 0,
  });

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await riskTicketService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await riskTicketService.getTickets({
        page,
        pageSize,
        level: levelFilter || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });

      let filteredList = result.list;
      if (keyword) {
        const keywordLower = keyword.toLowerCase();
        filteredList = filteredList.filter(
          (t) =>
            t.title.toLowerCase().includes(keywordLower) ||
            t.caseName.toLowerCase().includes(keywordLower) ||
            t.description.toLowerCase().includes(keywordLower)
        );
      }

      setTickets(filteredList);
      setTotal(result.total);
    } catch (error) {
      console.error('获取工单列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, levelFilter, statusFilter, typeFilter, keyword]);

  useEffect(() => {
    fetchStatistics();
    fetchTickets();
  }, [fetchStatistics, fetchTickets]);

  const handleSearch = () => {
    setPage(1);
    fetchTickets();
  };

  const handleReset = () => {
    setLevelFilter('');
    setStatusFilter('');
    setTypeFilter('');
    setKeyword('');
    setPage(1);
  };

  const handleView = (id: string) => {
    console.log('查看详情:', id);
  };

  const handleProcess = async (id: string) => {
    try {
      await riskTicketService.handleTicket(id, 'current-user', '当前用户');
      fetchStatistics();
      fetchTickets();
    } catch (error) {
      console.error('处理工单失败:', error);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await riskTicketService.closeTicket(id);
      fetchStatistics();
      fetchTickets();
    } catch (error) {
      console.error('关闭工单失败:', error);
    }
  };

  const handleNewTicket = () => {
    console.log('新增工单');
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

  const getLevelIcon = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return <Flame className="w-4 h-4" />;
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  const getRowClass = (level: RiskLevel, status: RiskStatus) => {
    if (status === 'closed') return 'bg-neutral-50 opacity-60';
    if (status === 'resolved') return 'bg-success-50/30';
    if (level === 'critical') return 'bg-danger-50/60';
    if (level === 'high') return 'bg-danger-50/30';
    if (level === 'medium') return 'bg-warning-50/20';
    return 'hover:bg-neutral-50';
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
    {
      key: 'total',
      label: '总工单数',
      value: statistics.total,
      icon: <FileText className="w-5 h-5" />,
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      iconBg: 'bg-primary-500',
    },
    {
      key: 'pending',
      label: '待处理',
      value: statistics.pending,
      icon: <Clock className="w-5 h-5" />,
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600',
      iconBg: 'bg-warning-500',
      highlight: true,
      pulse: statistics.pending > 0,
    },
    {
      key: 'processing',
      label: '处理中',
      value: statistics.processing,
      icon: <PlayCircle className="w-5 h-5" />,
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      iconBg: 'bg-primary-500',
    },
    {
      key: 'resolved',
      label: '已解决',
      value: statistics.resolved,
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      iconBg: 'bg-success-500',
    },
    {
      key: 'high',
      label: '高风险',
      value: statistics.high + statistics.critical,
      icon: <Flame className="w-5 h-5" />,
      bgColor: 'bg-danger-100/50',
      textColor: 'text-danger-700',
      iconBg: 'bg-danger-600',
      pulse: statistics.high + statistics.critical > 0,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">风险工单</h1>
          <p className="text-sm text-neutral-500 mt-1">
            管理和跟踪各类风险工单，及时发现并处理法律风险，保障案件质量
          </p>
        </div>
        <button
          onClick={handleNewTicket}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增工单
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            className={cn(
              'stat-card relative overflow-hidden',
              stat.bgColor,
              stat.highlight && 'ring-2 ring-warning-300 ring-offset-1'
            )}
          >
            {stat.pulse && (
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
            {stat.highlight && (
              <div className="mt-3 pt-3 border-t border-warning-200/50">
                <span className="text-xs text-warning-600 font-medium">
                  需及时处理
                </span>
              </div>
            )}
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
            <label className="label-text">风险等级</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as RiskLevel | '')}
              className="select-field"
            >
              <option value="">全部等级</option>
              {Object.entries(RISK_LEVEL_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">工单状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RiskStatus | '')}
              className="select-field"
            >
              <option value="">全部状态</option>
              {Object.entries(RISK_STATUS_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">工单类型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RiskType | '')}
              className="select-field"
            >
              <option value="">全部类型</option>
              {Object.entries(RISK_TYPE_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
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
                  placeholder="输入工单标题、案件名称搜索"
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
            <Clock className="w-3.5 h-3.5" />
            <span>按创建时间降序排列</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">工单标题</th>
                <th className="px-4 py-3 text-left font-medium">所属案件</th>
                <th className="px-4 py-3 text-left font-medium">工单类型</th>
                <th className="px-4 py-3 text-center font-medium">风险等级</th>
                <th className="px-4 py-3 text-center font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">上报人</th>
                <th className="px-4 py-3 text-left font-medium">处理人</th>
                <th className="px-4 py-3 text-left font-medium">创建时间</th>
                <th className="px-4 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                      <span>加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldAlert className="w-12 h-12 text-neutral-300" />
                      <span>暂无工单数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={cn(
                      'transition-colors duration-200',
                      getRowClass(ticket.level, ticket.status),
                      ticket.level === 'critical' && ticket.status !== 'closed' && ticket.status !== 'resolved' && 'animate-pulse-slow'
                    )}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'flex-shrink-0',
                            ticket.level === 'critical' && 'text-danger-600',
                            ticket.level === 'high' && 'text-danger-500',
                            ticket.level === 'medium' && 'text-warning-500',
                            ticket.level === 'low' && 'text-success-500'
                          )}
                        >
                          {getLevelIcon(ticket.level)}
                        </span>
                        <span className="font-medium text-neutral-700 max-w-xs truncate">
                          {ticket.title}
                        </span>
                        {ticket.level === 'critical' && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-bold bg-danger-500 text-white rounded">
                            紧急
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-600 max-w-xs truncate">
                        {ticket.caseName}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-neutral-600">
                        {RISK_TYPE_MAP[ticket.type]}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1',
                          getBadgeClass(RISK_LEVEL_MAP[ticket.level].color)
                        )}
                      >
                        {getLevelIcon(ticket.level)}
                        {RISK_LEVEL_MAP[ticket.level].label}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(getBadgeClass(RISK_STATUS_MAP[ticket.status].color))}>
                        {RISK_STATUS_MAP[ticket.status].label}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-neutral-600">{ticket.reporterName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-neutral-600">
                          {ticket.handlerName || <span className="text-neutral-400">未分配</span>}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono text-neutral-600">
                          {formatDateTime(ticket.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(ticket.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ticket.status === 'pending' && (
                          <button
                            onClick={() => handleProcess(ticket.id)}
                            className="p-1.5 text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                            title="处理"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}
                        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                          <button
                            onClick={() => handleClose(ticket.id)}
                            className="p-1.5 text-neutral-500 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                            title="关闭"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
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

export default TicketList;
