import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  ChevronRight,
  Edit3,
  FileCheck,
  Archive,
  Clock,
  FileText,
  Paperclip,
  Wallet,
  History,
  User,
  Building2,
  Scale,
  Briefcase,
  UserCheck,
  Users,
  RefreshCw,
  Download,
  Eye,
  CircleDot,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { Case, Document, Payment, CaseLog, Evidence } from '@/types';
import { caseService } from '@/services/caseService';
import { documentService } from '@/services/documentService';
import { paymentService } from '@/services/paymentService';
import {
  CASE_STATUS_MAP,
  CASE_TYPE_MAP,
  CASE_PHASE_MAP,
  DOCUMENT_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  PAYMENT_TYPE_MAP,
  PAYMENT_STAGE_MAP,
} from '@/constants';
import { formatCurrency, formatDateTime, cn } from '@/utils';

type TabKey = 'progress' | 'documents' | 'evidence' | 'payments' | 'logs';

type ProgressStepStatus = 'done' | 'current' | 'pending';

interface ProgressStep {
  key: string;
  label: string;
  date?: string;
  status: ProgressStepStatus;
}

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [caseLogs, setCaseLogs] = useState<CaseLog[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('progress');

  const tabs = [
    { key: 'progress' as TabKey, label: '案件进度', icon: Clock },
    { key: 'documents' as TabKey, label: '文书列表', icon: FileText },
    { key: 'evidence' as TabKey, label: '证据材料', icon: Paperclip },
    { key: 'payments' as TabKey, label: '费用记录', icon: Wallet },
    { key: 'logs' as TabKey, label: '操作日志', icon: History },
  ];

  const fetchCaseDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [caseResult, docsResult, paymentsResult, logsResult] = await Promise.all([
        caseService.getById(id),
        documentService.getDocuments({ caseId: id, page: 1, pageSize: 100 }),
        paymentService.getPayments({ caseId: id, page: 1, pageSize: 100 }),
        caseService.getCaseLogs(id),
      ]);
      setCaseData(caseResult);
      setDocuments(docsResult.list);
      setPayments(paymentsResult.list);
      setCaseLogs(logsResult);
      setEvidenceList([]);
    } catch (error) {
      console.error('获取案件详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const handleBack = () => {
    navigate('/cases');
  };

  const handleEdit = () => {
    navigate(`/cases/${id}/edit`);
  };

  const handleCloseCase = () => {
    if (!id) return;
    if (window.confirm('确定要申请结案吗？')) {
      caseService.closeCase(id).then(() => {
        fetchCaseDetail();
      });
    }
  };

  const handleArchive = () => {
    if (window.confirm('确定要申请归档吗？')) {
      alert('归档申请已提交');
    }
  };

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

  const progressSteps: ProgressStep[] = caseData
    ? [
        { key: 'intake', label: '收案阶段', date: caseData.createdAt, status: 'done' },
        {
          key: 'pre_trial',
          label: '庭前阶段',
          date: caseData.acceptedAt,
          status: caseData.phase !== 'intake' ? 'done' : 'current',
        },
        {
          key: 'trial',
          label: '审理阶段',
          date: undefined,
          status: ['trial', 'judgment', 'closed'].includes(caseData.phase) ? 'done' : 'pending',
        },
        {
          key: 'judgment',
          label: '判决阶段',
          date: undefined,
          status: ['judgment', 'closed'].includes(caseData.phase) ? 'done' : 'pending',
        },
        {
          key: 'closed',
          label: '已结案',
          date: caseData.closeAt,
          status: caseData.phase === 'closed' ? 'done' : 'pending',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
            <span className="text-neutral-500">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <div className="card text-center py-20">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">案件不存在或已被删除</p>
          <button onClick={handleBack} className="btn-primary">
            返回案件列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>案件列表</span>
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
        >
          <Home className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-700">案件详情</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="page-title mb-1">{caseData.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500 font-mono">{caseData.caseNo}</span>
              <span className={cn(getBadgeClass(CASE_STATUS_MAP[caseData.status].color))}>
                {CASE_STATUS_MAP[caseData.status].label}
              </span>
              <span className="badge badge-neutral">
                {CASE_TYPE_MAP[caseData.type]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            编辑案件
          </button>
          {caseData.status !== 'closed' && caseData.status !== 'archived' && (
            <button
              onClick={handleCloseCase}
              className="btn-success flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              结案申请
            </button>
          )}
          {caseData.status === 'closed' && (
            <button
              onClick={handleArchive}
              className="btn-primary flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              归档申请
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-primary-500" />
              <h2 className="section-title mb-0">基本信息</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-text mb-1">案号</p>
                <p className="value-text font-mono text-primary-600">{caseData.caseNo}</p>
              </div>
              <div>
                <p className="label-text mb-1">案件名称</p>
                <p className="value-text font-medium">{caseData.name}</p>
              </div>
              <div>
                <p className="label-text mb-1">案件类型</p>
                <p className="value-text">{CASE_TYPE_MAP[caseData.type]}</p>
              </div>
              <div>
                <p className="label-text mb-1">案由</p>
                <p className="value-text">{caseData.cause}</p>
              </div>
              <div>
                <p className="label-text mb-1">管辖法院</p>
                <p className="value-text">{caseData.court}</p>
              </div>
              <div>
                <p className="label-text mb-1">涉案金额</p>
                <p className="value-text font-mono font-medium text-primary-600">
                  ¥{formatCurrency(caseData.amount)}
                </p>
              </div>
              <div>
                <p className="label-text mb-1">案件状态</p>
                <span className={cn(getBadgeClass(CASE_STATUS_MAP[caseData.status].color))}>
                  {CASE_STATUS_MAP[caseData.status].label}
                </span>
              </div>
              <div>
                <p className="label-text mb-1">当前阶段</p>
                <p className="value-text">{CASE_PHASE_MAP[caseData.phase]}</p>
              </div>
            </div>
            {caseData.description && (
              <>
                <div className="divider" />
                <div>
                  <p className="label-text mb-1">案情描述</p>
                  <p className="value-text text-neutral-600 leading-relaxed">
                    {caseData.description}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-500" />
              <h2 className="section-title mb-0">当事人信息</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-primary-700">我方当事人</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-primary-500 mb-0.5">客户名称</p>
                    <p className="text-sm font-medium text-primary-800">{caseData.clientName}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-danger-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-danger-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-danger-700">对方当事人</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-danger-500 mb-0.5">当事人名称</p>
                    <p className="text-sm font-medium text-danger-800">{caseData.oppositeParty}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-primary-500" />
              <h2 className="section-title mb-0">办案团队</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Scale className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-xs text-neutral-500 mb-1">承办律师</p>
                <p className="text-sm font-medium text-neutral-700">
                  {caseData.lawyerName || <span className="text-neutral-400">未分配</span>}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-warning-600" />
                </div>
                <p className="text-xs text-neutral-500 mb-1">合伙人</p>
                <p className="text-sm font-medium text-neutral-700">
                  {caseData.partnerName || <span className="text-neutral-400">未分配</span>}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-neutral-600" />
                </div>
                <p className="text-xs text-neutral-500 mb-1">律师助理</p>
                <p className="text-sm font-medium text-neutral-700">
                  {caseData.assistantName || <span className="text-neutral-400">未分配</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary-500" />
              <h2 className="section-title mb-0">法院信息</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">管辖法院</p>
                <p className="text-sm font-medium text-neutral-700">{caseData.court}</p>
              </div>
              {caseData.judge && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">承办法官</p>
                  <p className="text-sm font-medium text-neutral-700">{caseData.judge}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-neutral-500 mb-1">立案时间</p>
                <p className="text-sm text-neutral-700">{formatDateTime(caseData.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-primary-500" />
              <h2 className="section-title mb-0">费用概览</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">涉案金额</span>
                <span className="text-sm font-mono font-medium text-neutral-700">
                  ¥{formatCurrency(caseData.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">已收费用</span>
                <span className="text-sm font-mono font-medium text-success-600">
                  ¥{formatCurrency(payments.reduce((sum, p) => sum + p.paidAmount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">待收费用</span>
                <span className="text-sm font-mono font-medium text-warning-600">
                  ¥{formatCurrency(payments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0))}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${payments.length > 0 ? Math.min(100, (payments.reduce((sum, p) => sum + p.paidAmount, 0) / (payments.reduce((sum, p) => sum + p.amount, 0) || 1)) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center gap-4 border-b border-neutral-200 -mx-4 -mt-4 px-4 mb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pt-4">
          {activeTab === 'progress' && (
            <div className="py-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />
                <div className="space-y-6">
                  {progressSteps.map((step, index) => (
                    <div key={step.key} className="relative flex items-start gap-4">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2',
                          step.status === 'done' && 'bg-primary-500 border-primary-500',
                          step.status === 'current' && 'bg-white border-primary-500',
                          step.status === 'pending' && 'bg-white border-neutral-300'
                        )}
                      >
                        {step.status === 'done' ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : step.status === 'current' ? (
                          <CircleDot className="w-5 h-5 text-primary-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-neutral-300" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <h4
                            className={cn(
                              'text-sm font-medium',
                              step.status === 'done' && 'text-primary-700',
                              step.status === 'current' && 'text-primary-600',
                              step.status === 'pending' && 'text-neutral-400'
                            )}
                          >
                            {CASE_PHASE_MAP[step.key as keyof typeof CASE_PHASE_MAP]}
                          </h4>
                          {step.date ? (
                            <span className="text-xs text-neutral-500">
                              {formatDateTime(step.date)}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">待处理</span>
                          )}
                        </div>
                        {step.status === 'current' && (
                          <p className="text-xs text-primary-500 mt-1">进行中...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="py-2">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">暂无文书</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="px-4 py-3 text-left font-medium">文书标题</th>
                        <th className="px-4 py-3 text-left font-medium">类型</th>
                        <th className="px-4 py-3 text-center font-medium">版本</th>
                        <th className="px-4 py-3 text-center font-medium">状态</th>
                        <th className="px-4 py-3 text-left font-medium">更新时间</th>
                        <th className="px-4 py-3 text-center font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary-500" />
                              <span className="font-medium text-neutral-700">{doc.title}</span>
                            </div>
                          </td>
                          <td className="table-cell">{doc.type}</td>
                          <td className="table-cell text-center">
                            <span className="text-sm font-mono text-neutral-600">
                              V{doc.currentVersion}
                            </span>
                          </td>
                          <td className="table-cell text-center">
                            <span className={cn(getBadgeClass(DOCUMENT_STATUS_MAP[doc.status].color))}>
                              {DOCUMENT_STATUS_MAP[doc.status].label}
                            </span>
                          </td>
                          <td className="table-cell">{formatDateTime(doc.updatedAt)}</td>
                          <td className="table-cell">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => navigate(`/documents/${doc.id}`)}
                                className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                title="查看"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                title="下载"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="py-2">
              {evidenceList.length === 0 ? (
                <div className="text-center py-12">
                  <Paperclip className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">暂无证据材料</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {evidenceList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <Paperclip className="w-6 h-6 text-neutral-500" />
                      </div>
                      <p className="text-sm font-medium text-neutral-700 text-center truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-400 text-center mt-1">{item.type}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="py-2">
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">暂无费用记录</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="px-4 py-3 text-left font-medium">收费类型</th>
                        <th className="px-4 py-3 text-left font-medium">阶段</th>
                        <th className="px-4 py-3 text-right font-medium">应收金额</th>
                        <th className="px-4 py-3 text-right font-medium">已收金额</th>
                        <th className="px-4 py-3 text-center font-medium">状态</th>
                        <th className="px-4 py-3 text-left font-medium">创建时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="table-cell">{PAYMENT_TYPE_MAP[payment.type]}</td>
                          <td className="table-cell">{PAYMENT_STAGE_MAP[payment.stage]}</td>
                          <td className="table-cell text-right font-mono">
                            ¥{formatCurrency(payment.amount)}
                          </td>
                          <td className="table-cell text-right font-mono text-success-600">
                            ¥{formatCurrency(payment.paidAmount)}
                          </td>
                          <td className="table-cell text-center">
                            <span className={cn(getBadgeClass(PAYMENT_STATUS_MAP[payment.status].color))}>
                              {PAYMENT_STATUS_MAP[payment.status].label}
                            </span>
                          </td>
                          <td className="table-cell">{formatDateTime(payment.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="py-2">
              {caseLogs.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">暂无操作日志</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-200" />
                  <div className="space-y-4">
                    {caseLogs.map((log) => (
                      <div key={log.id} className="relative flex items-start gap-4 pl-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 z-10">
                          <History className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-neutral-700">
                                {log.action}
                              </span>
                              <span className="text-xs text-neutral-500">
                                操作人：{log.operatorName}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400">
                              {formatDateTime(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500">{log.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
