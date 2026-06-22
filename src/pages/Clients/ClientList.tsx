import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Building2,
  User,
  TrendingUp,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { caseService } from '@/services/caseService';
import type { Client } from '@/types';
import { formatNumber, cn } from '@/utils';

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    enterprise: 0,
    individual: 0,
    thisMonth: 0,
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [caseCountMap, setCaseCountMap] = useState<Record<string, number>>({});

  const loadCaseCounts = useCallback(async () => {
    try {
      const result = await caseService.getCases();
      const countMap: Record<string, number> = {};
      result.list.forEach((c) => {
        countMap[c.clientId] = (countMap[c.clientId] || 0) + 1;
      });
      setCaseCountMap(countMap);
    } catch (error) {
      console.error('Failed to load case counts:', error);
    }
  }, []);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        pageSize: number;
        type?: 'individual' | 'enterprise';
        keyword?: string;
      } = {
        page,
        pageSize,
      };

      if (filterType !== 'all') {
        params.type = filterType as 'individual' | 'enterprise';
      }
      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const result = await clientService.getClients(params);
      setClients(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterType, keyword]);

  const loadStats = useCallback(async () => {
    try {
      const result = await clientService.getStatistics();
      setStats(result);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadCaseCounts();
  }, [loadStats, loadCaseCounts]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleReset = () => {
    setFilterType('all');
    setKeyword('');
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setFilterType(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该客户吗？')) {
      try {
        const success = await clientService.delete(id);
        if (success) {
          loadClients();
          loadStats();
          loadCaseCounts();
        }
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const statCards = [
    {
      key: 'total',
      label: '总客户数',
      value: stats.total,
      icon: Users,
      color: 'primary',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      key: 'enterprise',
      label: '企业客户',
      value: stats.enterprise,
      icon: Building2,
      color: 'success',
      bgColor: 'bg-success-50',
      iconColor: 'text-success-500',
    },
    {
      key: 'individual',
      label: '个人客户',
      value: stats.individual,
      icon: User,
      color: 'warning',
      bgColor: 'bg-warning-50',
      iconColor: 'text-warning-500',
    },
    {
      key: 'thisMonth',
      label: '本月新增',
      value: stats.thisMonth,
      icon: TrendingUp,
      color: 'accent',
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">客户管理</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增客户
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.key} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-label">{card.label}</p>
                  <p className="stat-value mt-2">{formatNumber(card.value)}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.bgColor)}>
                  <IconComponent className={cn('w-5 h-5', card.iconColor)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">筛选条件</span>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-neutral-500 hover:text-primary-500 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-48">
            <label className="label-text">客户类型</label>
            <select
              value={filterType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="select-field"
            >
              <option value="all">全部类型</option>
              <option value="enterprise">企业客户</option>
              <option value="individual">个人客户</option>
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <label className="label-text">关键词搜索</label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入客户名称、联系人或电话搜索"
                className="input-field pr-10"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-primary-500"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="self-end">
            <button onClick={handleSearch} className="btn-primary">
              搜索
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header border-b border-neutral-200">
                <th className="px-4 py-3 text-left font-medium">客户名称</th>
                <th className="px-4 py-3 text-left font-medium">客户类型</th>
                <th className="px-4 py-3 text-left font-medium">联系人</th>
                <th className="px-4 py-3 text-left font-medium">联系电话</th>
                <th className="px-4 py-3 text-left font-medium">行业</th>
                <th className="px-4 py-3 text-left font-medium">委托案件数</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="font-medium text-neutral-700">{client.name}</div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={cn(
                          'badge',
                          client.type === 'enterprise' ? 'badge-primary' : 'badge-warning'
                        )}
                      >
                        {client.type === 'enterprise' ? '企业客户' : '个人客户'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {client.contactPerson || '-'}
                    </td>
                    <td className="table-cell">{client.phone}</td>
                    <td className="table-cell">
                      {client.industry || '-'}
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-primary-600">
                        {caseCountMap[client.id] || 0}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-neutral-500 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-neutral-500 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-1.5 text-neutral-500 hover:text-danger-500 hover:bg-danger-50 rounded-md transition-colors"
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

        {total > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-500">
              共 <span className="font-medium text-neutral-700">{formatNumber(total)}</span> 条记录
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors',
                  page === 1
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {renderPageNumbers().map((p, index) => (
                <button
                  key={index}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors',
                    p === page
                      ? 'bg-primary-500 text-white font-medium'
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
                  'w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors',
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

export default ClientList;
