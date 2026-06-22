import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  RefreshCw,
  Wallet,
  TrendingUp,
  Calendar,
  FileText,
  Receipt
} from 'lucide-react';
import { Payment, PaymentStatus, PaymentType } from '@/types';
import { paymentService } from '@/services/paymentService';
import { 
  PAYMENT_TYPE_MAP, 
  PAYMENT_STATUS_MAP, 
  PAYMENT_STAGE_MAP 
} from '@/constants';
import { formatCurrency, cn } from '@/utils';

interface Statistics {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  count: number;
  thisMonth: number;
}

const Finance: React.FC = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [typeFilter, setTypeFilter] = useState<PaymentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [keyword, setKeyword] = useState('');

  const [statistics, setStatistics] = useState<Statistics>({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    count: 0,
    thisMonth: 0,
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const result = await paymentService.getPayments({
        page,
        pageSize,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
      });
      setPayments(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取费用列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await paymentService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, [page, typeFilter, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchPayments();
  };

  const handleReset = () => {
    setTypeFilter('');
    setStatusFilter('');
    setKeyword('');
    setPage(1);
  };

  const handleView = (id: string) => {
    navigate(`/finance/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/finance/${id}/edit`);
  };

  const handleInvoice = async (id: string) => {
    try {
      const result = await paymentService.issueInvoice(id);
      if (result) {
        fetchPayments();
        fetchStatistics();
      }
    } catch (error) {
      console.error('开票失败:', error);
    }
  };

  const handleNew = () => {
    navigate('/finance/new');
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

  const getInvoiceStatusText = (status: string) => {
    const map: Record<string, string> = {
      'none': '未开票',
      'issued': '已开票',
      'void': '已作废',
    };
    return map[status] || status;
  };

  const getInvoiceStatusClass = (status: string) => {
    const map: Record<string, string> = {
      'none': 'badge badge-neutral',
      'issued': 'badge badge-success',
      'void': 'badge badge-danger',
    };
    return map[status] || 'badge badge-neutral';
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
      label: '收费总额',
      value: statistics.paidAmount,
      icon: Wallet,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: '待收金额',
      value: statistics.unpaidAmount,
      icon: TrendingUp,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      label: '本月收款',
      value: statistics.thisMonth,
      icon: Calendar,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: '收费案件数',
      value: statistics.count,
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      isCount: true,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">费用中心</h1>
          <p className="text-sm text-neutral-500 mt-1">管理律所所有收费记录，支持筛选、搜索和分页查看</p>
        </div>
        <button
          onClick={handleNew}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增收费
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className={cn("stat-value mt-2", stat.color)}>
                  {stat.isCount ? statistics.count : formatCurrency(stat.value)}
                </p>
              </div>
              <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
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
            <label className="label-text">收费类型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PaymentType | '')}
              className="select-field"
            >
              <option value="">全部类型</option>
              {Object.entries(PAYMENT_TYPE_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">收费状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
              className="select-field"
            >
              <option value="">全部状态</option>
              {Object.entries(PAYMENT_STATUS_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
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
                  placeholder="输入案件名称或客户名称搜索"
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
                <th className="px-4 py-3 text-left font-medium">案件名称</th>
                <th className="px-4 py-3 text-left font-medium">客户名称</th>
                <th className="px-4 py-3 text-left font-medium">收费类型</th>
                <th className="px-4 py-3 text-right font-medium">应收金额</th>
                <th className="px-4 py-3 text-right font-medium">已收金额</th>
                <th className="px-4 py-3 text-left font-medium">收费阶段</th>
                <th className="px-4 py-3 text-center font-medium">收费状态</th>
                <th className="px-4 py-3 text-center font-medium">开票状态</th>
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
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-neutral-300" />
                      <span>暂无费用数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="font-medium text-neutral-700 max-w-xs truncate">
                        {payment.caseName}
                      </div>
                    </td>
                    <td className="table-cell">
                      {payment.clientName}
                    </td>
                    <td className="table-cell">
                      {PAYMENT_TYPE_MAP[payment.type]}
                    </td>
                    <td className="table-cell text-right font-mono text-neutral-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="table-cell text-right font-mono font-medium text-primary-600">
                      {formatCurrency(payment.paidAmount)}
                    </td>
                    <td className="table-cell">
                      {PAYMENT_STAGE_MAP[payment.stage]}
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(getBadgeClass(PAYMENT_STATUS_MAP[payment.status].color))}>
                        {PAYMENT_STATUS_MAP[payment.status].label}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={cn(getInvoiceStatusClass(payment.invoiceStatus))}>
                        {getInvoiceStatusText(payment.invoiceStatus)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(payment.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleInvoice(payment.id)}
                          disabled={payment.invoiceStatus === 'issued'}
                          className={cn(
                            "p-1.5 rounded-md transition-colors",
                            payment.invoiceStatus === 'issued'
                              ? "text-neutral-300 cursor-not-allowed"
                              : "text-neutral-500 hover:text-success-600 hover:bg-success-50"
                          )}
                          title="开票"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(payment.id)}
                          className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
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

export default Finance;
