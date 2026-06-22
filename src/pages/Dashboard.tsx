import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import {
  Briefcase,
  PlusCircle,
  AlertTriangle,
  CheckSquare,
  FileText,
  DollarSign,
  Archive,
  ClipboardList,
  Clock,
  Activity,
  TrendingUp,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react';
import { caseService } from '@/services/caseService';
import { deadlineService } from '@/services/deadlineService';
import { paymentService } from '@/services/paymentService';
import { operationLogService } from '@/services/operationLogService';
import { riskTicketService } from '@/services/riskTicketService';
import type { Deadline, OperationLog, CaseType } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils';
import { cn } from '@/lib/utils';

const caseTypeLabels: Record<CaseType, string> = {
  civil: '民事案件',
  criminal: '刑事案件',
  administrative: '行政案件',
  commercial: '商事案件',
  labor: '劳动争议',
  other: '其他案件',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [caseStats, setCaseStats] = useState({
    total: 0,
    inProgress: 0,
    pending: 0,
    closed: 0,
    thisMonth: 0,
  });
  const [deadlineStats, setDeadlineStats] = useState({
    total: 0,
    normal: 0,
    warning: 0,
    urgent: 0,
    overdue: 0,
  });
  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    count: 0,
    thisMonth: 0,
  });
  const [riskStats, setRiskStats] = useState({
    pending: 0,
    processing: 0,
    total: 0,
  });
  const [urgentDeadlines, setUrgentDeadlines] = useState<Deadline[]>([]);
  const [recentLogs, setRecentLogs] = useState<OperationLog[]>([]);
  const [caseTypeData, setCaseTypeData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ months: string[]; data: number[] }>({
    months: [],
    data: [],
  });
  const [loading, setLoading] = useState(true);

  const pieChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const pieChartInstance = useRef<echarts.ECharts | null>(null);
  const lineChartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          caseStatsResult,
          deadlineStatsResult,
          paymentStatsResult,
          riskStatsResult,
          urgentDeadlinesResult,
          logsResult,
          casesResult,
        ] = await Promise.all([
          caseService.getStatistics(),
          deadlineService.getStatistics(),
          paymentService.getStatistics(),
          riskTicketService.getStatistics(),
          deadlineService.getUrgentDeadlines(5),
          operationLogService.getLogs({ page: 1, pageSize: 8 }),
          caseService.getCases(),
        ]);

        setCaseStats(caseStatsResult);
        setDeadlineStats(deadlineStatsResult);
        setPaymentStats(paymentStatsResult);
        setRiskStats(riskStatsResult);
        setUrgentDeadlines(urgentDeadlinesResult);
        setRecentLogs(logsResult.list);

        const typeCount: Record<string, number> = {};
        casesResult.list.forEach((c) => {
          const label = caseTypeLabels[c.type] || c.type;
          typeCount[label] = (typeCount[label] || 0) + 1;
        });
        const pieData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
        setCaseTypeData(pieData);

        const months: string[] = [];
        const monthlyData: number[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = `${d.getMonth() + 1}月`;
          months.push(monthLabel);
          const count = casesResult.list.filter((c) => {
            const cd = new Date(c.createdAt);
            return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
          }).length;
          monthlyData.push(count);
        }
        setMonthlyTrend({ months, data: monthlyData });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (pieChartRef.current && caseTypeData.length > 0) {
      if (!pieChartInstance.current) {
        pieChartInstance.current = echarts.init(pieChartRef.current);
      }

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            color: '#606266',
            fontSize: 12,
          },
        },
        color: ['#0F2B5B', '#5D7FBA', '#B3C6E1', '#B8860B', '#F57C00', '#2E7D32'],
        series: [
          {
            name: '案件类型',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
                color: '#0F2B5B',
              },
            },
            labelLine: {
              show: false,
            },
            data: caseTypeData,
          },
        ],
      };

      pieChartInstance.current.setOption(option);
    }

    return () => {
      if (pieChartInstance.current) {
        pieChartInstance.current.dispose();
        pieChartInstance.current = null;
      }
    };
  }, [caseTypeData]);

  useEffect(() => {
    if (lineChartRef.current && monthlyTrend.months.length > 0) {
      if (!lineChartInstance.current) {
        lineChartInstance.current = echarts.init(lineChartRef.current);
      }

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}新增: {c}件',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: monthlyTrend.months,
          axisLine: {
            lineStyle: {
              color: '#E4E7ED',
            },
          },
          axisLabel: {
            color: '#606266',
            fontSize: 12,
          },
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: '#F5F7FA',
            },
          },
          axisLabel: {
            color: '#606266',
            fontSize: 12,
          },
        },
        series: [
          {
            name: '新增案件',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              color: '#0F2B5B',
              width: 3,
            },
            itemStyle: {
              color: '#0F2B5B',
              borderColor: '#fff',
              borderWidth: 2,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(15, 43, 91, 0.3)' },
                { offset: 1, color: 'rgba(15, 43, 91, 0.02)' },
              ]),
            },
            data: monthlyTrend.data,
          },
        ],
      };

      lineChartInstance.current.setOption(option);
    }

    const handleResize = () => {
      pieChartInstance.current?.resize();
      lineChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
        lineChartInstance.current = null;
      }
    };
  }, [monthlyTrend]);

  const getDeadlineLevelColor = (level: string) => {
    switch (level) {
      case 'overdue':
        return 'text-danger-500 bg-danger-50';
      case 'urgent':
        return 'text-danger-500 bg-danger-50';
      case 'warning':
        return 'text-warning-500 bg-warning-50';
      default:
        return 'text-success-500 bg-success-50';
    }
  };

  const getDeadlineLevelText = (level: string, remainingDays: number) => {
    if (level === 'overdue') return `已逾期 ${Math.abs(remainingDays)} 天`;
    if (remainingDays === 0) return '今天到期';
    if (remainingDays === 1) return '明天到期';
    return `剩余 ${remainingDays} 天`;
  };

  const statCards = [
    {
      title: '在办案件',
      value: caseStats.inProgress,
      icon: Briefcase,
      color: 'primary',
      trend: `本月新增 ${caseStats.thisMonth} 件`,
      bgGradient: 'from-primary-500 to-primary-700',
    },
    {
      title: '本月新增',
      value: caseStats.thisMonth,
      icon: PlusCircle,
      color: 'success',
      trend: `待处理 ${caseStats.pending} 件`,
      bgGradient: 'from-success-500 to-success-700',
    },
    {
      title: '待处理风险',
      value: riskStats.pending,
      icon: AlertTriangle,
      color: 'danger',
      trend: `处理中 ${riskStats.processing} 件`,
      bgGradient: 'from-danger-500 to-danger-700',
    },
    {
      title: '时限预警',
      value: deadlineStats.urgent + deadlineStats.overdue,
      icon: Clock,
      color: 'warning',
      trend: `预警 ${deadlineStats.warning} 件`,
      bgGradient: 'from-warning-500 to-warning-700',
    },
  ];

  const quickActions = [
    { title: '收案登记', icon: ClipboardList, path: '/cases/new', color: 'primary' },
    { title: '文书中心', icon: FileText, path: '/documents', color: 'success' },
    { title: '费用管理', icon: DollarSign, path: '/finance', color: 'warning' },
    { title: '卷宗归档', icon: Archive, path: '/archive', color: 'primary' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">工作台</h1>
          <p className="text-sm text-neutral-500 mt-1">
            欢迎回来，今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Activity className="w-4 h-4" />
          <span>系统运行正常</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                'relative overflow-hidden rounded-xl p-5 text-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5',
                `bg-gradient-to-br ${card.bgGradient}`
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-4 -translate-x-4" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">{card.title}</span>
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{card.value}</span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-white/70 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>{card.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary-500 rounded-full" />
            快捷入口
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                    action.color === 'primary' && 'bg-primary-100 text-primary-600 group-hover:bg-primary-500 group-hover:text-white',
                    action.color === 'success' && 'bg-success-100 text-success-600 group-hover:bg-success-500 group-hover:text-white',
                    action.color === 'warning' && 'bg-warning-100 text-warning-600 group-hover:bg-warning-500 group-hover:text-white'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-danger-500 rounded-full" />
              时限预警
              <span className="text-xs font-normal text-danger-500 bg-danger-50 px-2 py-0.5 rounded-full">
                {deadlineStats.urgent + deadlineStats.overdue} 项紧急
              </span>
            </h2>
            <button
              onClick={() => navigate('/risk/deadlines')}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
            >
              查看全部
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {loading ? (
              <div className="p-8 text-center text-neutral-400 text-sm">加载中...</div>
            ) : urgentDeadlines.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm">暂无紧急时限</div>
            ) : (
              urgentDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="px-5 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/cases/${deadline.caseId}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Clock className={cn('w-4 h-4', deadline.level === 'overdue' || deadline.level === 'urgent' ? 'text-danger-500' : 'text-warning-500')} />
                        <span className="font-medium text-neutral-800 text-sm truncate">
                          {deadline.name}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-neutral-500 truncate">
                        {deadline.caseName}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span className="text-xs text-neutral-400">
                          {deadline.deadline}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-medium px-2.5 py-1 rounded-full',
                        getDeadlineLevelColor(deadline.level)
                      )}
                    >
                      {getDeadlineLevelText(deadline.level, deadline.remainingDays)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary-500 rounded-full" />
              案件动态
            </h2>
            <button
              onClick={() => navigate('/system/logs')}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
            >
              查看全部
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {loading ? (
              <div className="p-8 text-center text-neutral-400 text-sm">加载中...</div>
            ) : recentLogs.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm">暂无操作记录</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-800">{log.userName}</span>
                        <span className="text-xs text-neutral-400">{log.module}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-600 truncate">
                        {log.action} - {log.targetName}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary-500 rounded-full" />
              案件类型分布
            </h2>
          </div>
          <div ref={pieChartRef} className="h-72" />
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary-500 rounded-full" />
              月度收案趋势
            </h2>
          </div>
          <div ref={lineChartRef} className="h-72" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">收费总额</p>
              <p className="text-xl font-bold text-neutral-800">
                {formatCurrency(paymentStats.paidAmount)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">待收金额</p>
              <p className="text-xl font-bold text-neutral-800">
                {formatCurrency(paymentStats.unpaidAmount)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">合同总额</p>
              <p className="text-xl font-bold text-neutral-800">
                {formatCurrency(paymentStats.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
