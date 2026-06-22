import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import {
  Briefcase,
  PlusCircle,
  CheckSquare,
  Trophy,
  DollarSign,
  AlertCircle,
  Clock,
  Shield,
  Smile,
  Users,
  TrendingUp,
} from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import type {
  AnalyticsOverview,
  CaseTypeItem,
  LawyerRankItem,
  MonthlyTrendItem,
  CauseDistributionItem,
  ClientTypeItem,
  DeadlineStats,
  RiskStats,
  SatisfactionData,
} from '@/services/analyticsService';
import { formatCurrency } from '@/utils';

const Analytics: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [overview, setOverview] = useState<AnalyticsOverview>({
    activeCases: 0,
    newThisMonth: 0,
    closedCases: 0,
    winRate: 0,
    totalRevenue: 0,
    pendingAmount: 0,
  });
  const [caseTypeData, setCaseTypeData] = useState<CaseTypeItem[]>([]);
  const [lawyerRankData, setLawyerRankData] = useState<LawyerRankItem[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);
  const [causeData, setCauseData] = useState<CauseDistributionItem[]>([]);
  const [clientTypeData, setClientTypeData] = useState<ClientTypeItem[]>([]);
  const [deadlineStats, setDeadlineStats] = useState<DeadlineStats>({
    normal: 0,
    warning: 0,
    urgent: 0,
    overdue: 0,
  });
  const [riskStats, setRiskStats] = useState<RiskStats>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    pending: 0,
    processing: 0,
    resolved: 0,
  });
  const [satisfaction, setSatisfaction] = useState<SatisfactionData>({
    verySatisfied: 0,
    satisfied: 0,
    neutral: 0,
    dissatisfied: 0,
    overall: 0,
  });
  const [loading, setLoading] = useState(true);

  const caseTypeChartRef = useRef<HTMLDivElement>(null);
  const lawyerRankChartRef = useRef<HTMLDivElement>(null);
  const monthlyTrendChartRef = useRef<HTMLDivElement>(null);
  const causeChartRef = useRef<HTMLDivElement>(null);
  const clientTypeChartRef = useRef<HTMLDivElement>(null);
  const satisfactionChartRef = useRef<HTMLDivElement>(null);

  const caseTypeChart = useRef<echarts.ECharts | null>(null);
  const lawyerRankChart = useRef<echarts.ECharts | null>(null);
  const monthlyTrendChart = useRef<echarts.ECharts | null>(null);
  const causeChart = useRef<echarts.ECharts | null>(null);
  const clientTypeChart = useRef<echarts.ECharts | null>(null);
  const satisfactionChart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          overviewResult,
          caseTypeResult,
          lawyerRankResult,
          monthlyTrendResult,
          causeResult,
          clientTypeResult,
          deadlineResult,
          riskResult,
          satisfactionResult,
        ] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getCaseTypeDistribution(),
          analyticsService.getLawyerRanking(10),
          analyticsService.getMonthlyTrend(12),
          analyticsService.getCauseDistribution(),
          analyticsService.getClientTypeDistribution(),
          analyticsService.getDeadlineStats(),
          analyticsService.getRiskStats(),
          analyticsService.getSatisfactionData(),
        ]);

        setOverview(overviewResult);
        setCaseTypeData(caseTypeResult);
        setLawyerRankData(lawyerRankResult);
        setMonthlyTrend(monthlyTrendResult);
        setCauseData(causeResult);
        setClientTypeData(clientTypeResult);
        setDeadlineStats(deadlineResult);
        setRiskStats(riskResult);
        setSatisfaction(satisfactionResult);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const initCaseTypeChart = useCallback(() => {
    if (!caseTypeChartRef.current || caseTypeData.length === 0) return;

    if (!caseTypeChart.current) {
      caseTypeChart.current = echarts.init(caseTypeChartRef.current);
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(10, 22, 40, 0.9)',
        borderColor: '#1a3a6e',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#8fa3c4',
          fontSize: 12,
        },
      },
      color: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      series: [
        {
          name: '案件类型',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#0a1628',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(59, 130, 246, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: caseTypeData,
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDuration: 1500,
        },
      ],
    };

    caseTypeChart.current.setOption(option);
  }, [caseTypeData]);

  const initLawyerRankChart = useCallback(() => {
    if (!lawyerRankChartRef.current || lawyerRankData.length === 0) return;

    if (!lawyerRankChart.current) {
      lawyerRankChart.current = echarts.init(lawyerRankChartRef.current);
    }

    const names = lawyerRankData.map((item) => item.name).reverse();
    const values = lawyerRankData.map((item) => item.value).reverse();

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(10, 22, 40, 0.9)',
        borderColor: '#1a3a6e',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#8fa3c4',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(143, 163, 196, 0.1)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#8fa3c4',
          fontSize: 11,
        },
      },
      series: [
        {
          name: '办案数',
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#1e40af' },
              { offset: 1, color: '#3b82f6' },
            ]),
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(59, 130, 246, 0.5)',
            },
          },
          data: values,
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
    };

    lawyerRankChart.current.setOption(option);
  }, [lawyerRankData]);

  const initMonthlyTrendChart = useCallback(() => {
    if (!monthlyTrendChartRef.current || monthlyTrend.length === 0) return;

    if (!monthlyTrendChart.current) {
      monthlyTrendChart.current = echarts.init(monthlyTrendChartRef.current);
    }

    const months = monthlyTrend.map((item) => item.month);
    const intakeData = monthlyTrend.map((item) => item.intake);
    const closedData = monthlyTrend.map((item) => item.closed);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 22, 40, 0.9)',
        borderColor: '#1a3a6e',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
      },
      legend: {
        data: ['收案数', '结案数'],
        top: 0,
        right: '5%',
        itemWidth: 14,
        itemHeight: 10,
        textStyle: {
          color: '#8fa3c4',
          fontSize: 12,
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: {
          lineStyle: {
            color: 'rgba(143, 163, 196, 0.3)',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#8fa3c4',
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#8fa3c4',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(143, 163, 196, 0.1)',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '收案数',
          type: 'bar',
          barWidth: '35%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.2)' },
            ]),
          },
          data: intakeData,
          animationDuration: 1500,
        },
        {
          name: '结案数',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#10b981',
            width: 3,
          },
          itemStyle: {
            color: '#10b981',
            borderColor: '#0a1628',
            borderWidth: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.02)' },
            ]),
          },
          data: closedData,
          animationDuration: 1500,
          animationDelay: 500,
        },
      ],
    };

    monthlyTrendChart.current.setOption(option);
  }, [monthlyTrend]);

  const initCauseChart = useCallback(() => {
    if (!causeChartRef.current || causeData.length === 0) return;

    if (!causeChart.current) {
      causeChart.current = echarts.init(causeChartRef.current);
    }

    const names = causeData.slice(0, 8).map((item) => item.name).reverse();
    const values = causeData.slice(0, 8).map((item) => item.value).reverse();

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(10, 22, 40, 0.9)',
        borderColor: '#1a3a6e',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#8fa3c4',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(143, 163, 196, 0.1)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#8fa3c4',
          fontSize: 11,
        },
      },
      series: [
        {
          name: '案件数',
          type: 'bar',
          barWidth: '55%',
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#0e7490' },
              { offset: 1, color: '#06b6d4' },
            ]),
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(6, 182, 212, 0.5)',
            },
          },
          data: values,
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
    };

    causeChart.current.setOption(option);
  }, [causeData]);

  const initClientTypeChart = useCallback(() => {
    if (!clientTypeChartRef.current || clientTypeData.length === 0) return;

    if (!clientTypeChart.current) {
      clientTypeChart.current = echarts.init(clientTypeChartRef.current);
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(10, 22, 40, 0.9)',
        borderColor: '#1a3a6e',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#8fa3c4',
          fontSize: 12,
        },
      },
      color: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
      series: [
        {
          name: '客户类型',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#0a1628',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(139, 92, 246, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: clientTypeData,
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDuration: 1500,
        },
      ],
    };

    clientTypeChart.current.setOption(option);
  }, [clientTypeData]);

  const initSatisfactionChart = useCallback(() => {
    if (!satisfactionChartRef.current) return;

    if (!satisfactionChart.current) {
      satisfactionChart.current = echarts.init(satisfactionChartRef.current);
    }

    const option: echarts.EChartsOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          splitNumber: 10,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#10b981' },
            ]),
          },
          progress: {
            show: true,
            width: 16,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 16,
              color: [[1, 'rgba(143, 163, 196, 0.15)']],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          anchor: {
            show: false,
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            fontSize: 32,
            fontWeight: 'bold',
            color: '#fff',
            offsetCenter: [0, '5%'],
            formatter: '{value}%',
          },
          data: [
            {
              value: satisfaction.overall,
            },
          ],
          animationDuration: 2000,
          animationEasing: 'cubicOut',
        },
      ],
    };

    satisfactionChart.current.setOption(option);
  }, [satisfaction.overall]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        initCaseTypeChart();
        initLawyerRankChart();
        initMonthlyTrendChart();
        initCauseChart();
        initClientTypeChart();
        initSatisfactionChart();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [
    loading,
    initCaseTypeChart,
    initLawyerRankChart,
    initMonthlyTrendChart,
    initCauseChart,
    initClientTypeChart,
    initSatisfactionChart,
  ]);

  useEffect(() => {
    const handleResize = () => {
      caseTypeChart.current?.resize();
      lawyerRankChart.current?.resize();
      monthlyTrendChart.current?.resize();
      causeChart.current?.resize();
      clientTypeChart.current?.resize();
      satisfactionChart.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      caseTypeChart.current?.dispose();
      lawyerRankChart.current?.dispose();
      monthlyTrendChart.current?.dispose();
      causeChart.current?.dispose();
      clientTypeChart.current?.dispose();
      satisfactionChart.current?.dispose();
    };
  }, []);

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDay = weekDays[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${weekDay} ${hours}:${minutes}:${seconds}`;
  };

  const statCards = [
    {
      title: '在办案件',
      value: overview.activeCases,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-700',
      glowColor: 'shadow-blue-500/30',
      unit: '件',
    },
    {
      title: '本月新增',
      value: overview.newThisMonth,
      icon: PlusCircle,
      color: 'from-emerald-500 to-emerald-700',
      glowColor: 'shadow-emerald-500/30',
      unit: '件',
    },
    {
      title: '已结案件',
      value: overview.closedCases,
      icon: CheckSquare,
      color: 'from-cyan-500 to-cyan-700',
      glowColor: 'shadow-cyan-500/30',
      unit: '件',
    },
    {
      title: '胜诉率',
      value: overview.winRate,
      icon: Trophy,
      color: 'from-amber-500 to-amber-700',
      glowColor: 'shadow-amber-500/30',
      unit: '%',
    },
    {
      title: '收费总额',
      value: overview.totalRevenue,
      icon: DollarSign,
      color: 'from-violet-500 to-violet-700',
      glowColor: 'shadow-violet-500/30',
      unit: '元',
      isCurrency: true,
    },
    {
      title: '待收金额',
      value: overview.pendingAmount,
      icon: AlertCircle,
      color: 'from-rose-500 to-rose-700',
      glowColor: 'shadow-rose-500/30',
      unit: '元',
      isCurrency: true,
    },
  ];

  const formatValue = (value: number, isCurrency?: boolean, unit?: string) => {
    if (isCurrency) {
      return formatCurrency(value);
    }
    if (unit === '%') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  return (
    <div
      className="min-h-screen w-full p-4 text-white"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0F2B5B 50%, #0a1628 100%)',
      }}
    >
      <div className="relative h-full flex flex-col">
        <div className="text-center pb-4 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-cyan-400 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatDateTime(currentTime)}</span>
          </div>
          <h1
            className="text-3xl font-bold tracking-widest"
            style={{
              background: 'linear-gradient(90deg, #60a5fa 0%, #34d399 50%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            律所经营管理大屏
          </h1>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-emerald-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>系统运行正常</span>
          </div>
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)',
            }}
          />
        </div>

        <div className="grid grid-cols-6 gap-4 mb-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-lg p-4 bg-gradient-to-br ${card.color} shadow-lg ${card.glowColor} transform hover:scale-105 transition-all duration-300`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-3 -translate-x-3" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm font-medium">{card.title}</span>
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono tracking-tight">
                      {formatValue(card.value, card.isCurrency, card.unit)}
                    </span>
                    {!card.isCurrency && (
                      <span className="text-sm text-white/70">{card.unit}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4" style={{ minHeight: '500px' }}>
          <div className="col-span-3 flex flex-col gap-4">
            <div
              className="flex-1 rounded-lg p-4 border border-blue-500/20"
              style={{
                background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
                <h3 className="text-base font-semibold text-white">案件类型分布</h3>
              </div>
              <div ref={caseTypeChartRef} className="w-full h-56" />
            </div>

            <div
              className="flex-1 rounded-lg p-4 border border-blue-500/20"
              style={{
                background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full" />
                <h3 className="text-base font-semibold text-white">律师办案排行 Top10</h3>
              </div>
              <div ref={lawyerRankChartRef} className="w-full h-56" />
            </div>
          </div>

          <div className="col-span-6 flex flex-col">
            <div
              className="flex-1 rounded-lg p-4 border border-blue-500/20"
              style={{
                background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                <h3 className="text-base font-semibold text-white">月度收案/结案趋势</h3>
              </div>
              <div ref={monthlyTrendChartRef} className="w-full h-full" style={{ minHeight: '420px' }} />
            </div>
          </div>

          <div className="col-span-3 flex flex-col gap-4">
            <div
              className="flex-1 rounded-lg p-4 border border-blue-500/20"
              style={{
                background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-sky-400 rounded-full" />
                <h3 className="text-base font-semibold text-white">案由分布</h3>
              </div>
              <div ref={causeChartRef} className="w-full h-56" />
            </div>

            <div
              className="flex-1 rounded-lg p-4 border border-blue-500/20"
              style={{
                background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-violet-400 to-fuchsia-400 rounded-full" />
                <h3 className="text-base font-semibold text-white">客户类型分布</h3>
              </div>
              <div ref={clientTypeChartRef} className="w-full h-56" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div
            className="rounded-lg p-4 border border-blue-500/20"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-gradient-to-b from-rose-400 to-red-500 rounded-full" />
              <h3 className="text-base font-semibold text-white">时限预警统计</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {deadlineStats.normal}
                </div>
                <div className="text-xs text-emerald-400/70 mt-1">正常</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {deadlineStats.warning}
                </div>
                <div className="text-xs text-amber-400/70 mt-1">预警</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-2xl font-bold font-mono text-orange-400">
                  {deadlineStats.urgent}
                </div>
                <div className="text-xs text-orange-400/70 mt-1">紧急</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <div className="text-2xl font-bold font-mono text-rose-400">
                  {deadlineStats.overdue}
                </div>
                <div className="text-xs text-rose-400/70 mt-1">逾期</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">
                <Clock className="w-4 h-4 inline mr-1" />
                总计时限
              </span>
              <span className="text-white font-mono font-semibold">
                {deadlineStats.normal + deadlineStats.warning + deadlineStats.urgent + deadlineStats.overdue} 项
              </span>
            </div>
          </div>

          <div
            className="rounded-lg p-4 border border-blue-500/20"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-gradient-to-b from-red-400 to-rose-500 rounded-full" />
              <h3 className="text-base font-semibold text-white">风险事件统计</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-2xl font-bold font-mono text-red-400">
                  {riskStats.critical}
                </div>
                <div className="text-xs text-red-400/70 mt-1">严重</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-2xl font-bold font-mono text-orange-400">
                  {riskStats.high}
                </div>
                <div className="text-xs text-orange-400/70 mt-1">高危</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {riskStats.medium}
                </div>
                <div className="text-xs text-amber-400/70 mt-1">中危</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {riskStats.low}
                </div>
                <div className="text-xs text-emerald-400/70 mt-1">低危</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  <Shield className="w-4 h-4 inline mr-1" />
                  待处理
                </span>
                <span className="text-amber-400 font-mono font-semibold">{riskStats.pending}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">处理中</span>
                <span className="text-blue-400 font-mono font-semibold">{riskStats.processing}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">已解决</span>
                <span className="text-emerald-400 font-mono font-semibold">{riskStats.resolved}</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-4 border border-blue-500/20"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 43, 91, 0.6) 0%, rgba(10, 22, 40, 0.8) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full" />
              <h3 className="text-base font-semibold text-white">客户满意度</h3>
            </div>
            <div className="flex items-center gap-4">
              <div ref={satisfactionChartRef} className="w-32 h-32 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Smile className="w-4 h-4" />
                    非常满意
                  </span>
                  <span className="font-mono text-white">{satisfaction.verySatisfied}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    满意
                  </span>
                  <span className="font-mono text-white">{satisfaction.satisfied}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-400">一般</span>
                  <span className="font-mono text-white">{satisfaction.neutral}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-rose-400">不满意</span>
                  <span className="font-mono text-white">{satisfaction.dissatisfied}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">综合满意度</span>
                    <span className="text-emerald-400 font-mono font-bold text-lg">
                      {satisfaction.overall}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-blue-500/40 rounded-tl-lg pointer-events-none"
        />
        <div
          className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-blue-500/40 rounded-tr-lg pointer-events-none"
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-blue-500/40 rounded-bl-lg pointer-events-none"
        />
        <div
          className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-blue-500/40 rounded-br-lg pointer-events-none"
        />
      </div>
    </div>
  );
};

export default Analytics;
