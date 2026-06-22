import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  ChevronRight,
  User,
  Building2,
  Users,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Save,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Briefcase,
  FileText,
  DollarSign,
  Gavel,
} from 'lucide-react';
import { CaseType } from '@/types';
import { caseService } from '@/services/caseService';
import { clientService } from '@/services/clientService';
import { CASE_TYPE_MAP, CAUSE_LIST, COURT_LIST } from '@/constants';
import { cn, generateId } from '@/utils';

type ClientType = 'individual' | 'enterprise';
type ConflictCheckStatus = 'pending' | 'checking' | 'pass' | 'fail';

interface FormData {
  clientType: ClientType;
  clientName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  oppositePartyName: string;
  oppositePartyType: string;
  oppositePartyContact: string;
  caseType: CaseType | '';
  cause: string;
  court: string;
  amount: string;
  description: string;
  evidenceSummary: string;
}

interface FormErrors {
  clientName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  oppositePartyName?: string;
  caseType?: string;
  cause?: string;
  court?: string;
  amount?: string;
}

const CaseNew: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    clientType: 'enterprise',
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    oppositePartyName: '',
    oppositePartyType: 'enterprise',
    oppositePartyContact: '',
    caseType: '',
    cause: '',
    court: '',
    amount: '',
    description: '',
    evidenceSummary: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [conflictStatus, setConflictStatus] = useState<ConflictCheckStatus>('pending');
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(0);

  const sections = [
    { key: 'client', title: '客户信息', icon: Users },
    { key: 'opposite', title: '对方当事人', icon: User },
    { key: 'case', title: '案件信息', icon: Briefcase },
    { key: 'conflict', title: '利益冲突检索', icon: ShieldAlert },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (conflictStatus !== 'pending') {
      setConflictStatus('pending');
      setConflicts([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = '请输入客户名称';
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = formData.clientType === 'enterprise' ? '请输入法定代表人' : '请输入联系人';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone) && !/^0\d{2,3}-?\d{7,8}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的联系电话';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!formData.oppositePartyName.trim()) {
      newErrors.oppositePartyName = '请输入对方当事人名称';
    }
    if (!formData.caseType) {
      newErrors.caseType = '请选择案件类型';
    }
    if (!formData.cause.trim()) {
      newErrors.cause = '请输入或选择案由';
    }
    if (!formData.court.trim()) {
      newErrors.court = '请选择或输入管辖法院';
    }
    if (!formData.amount.trim()) {
      newErrors.amount = '请输入涉案金额';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = '请输入有效的金额';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckConflict = async () => {
    if (!formData.clientName.trim() || !formData.oppositePartyName.trim()) {
      if (!formData.clientName.trim()) {
        setErrors((prev) => ({ ...prev, clientName: '请先输入客户名称' }));
      }
      if (!formData.oppositePartyName.trim()) {
        setErrors((prev) => ({ ...prev, oppositePartyName: '请先输入对方当事人名称' }));
      }
      return;
    }

    setConflictStatus('checking');
    setConflicts([]);

    try {
      const result = await caseService.checkConflict(
        formData.clientName.trim(),
        formData.oppositePartyName.trim()
      );
      setConflicts(result.conflicts);
      setConflictStatus(result.hasConflict ? 'fail' : 'pass');
    } catch (error) {
      console.error('利益冲突检索失败:', error);
      setConflictStatus('pending');
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);

      let clientId = '';
      try {
        const newClient = await clientService.create({
          name: formData.clientName,
          type: formData.clientType,
          phone: formData.phone,
          email: formData.email || undefined,
          address: formData.address || undefined,
          contactPerson: formData.contactPerson || undefined,
        });
        clientId = newClient.id;
      } catch {
        clientId = generateId();
      }

      await caseService.create({
        name: `${formData.clientName} - ${formData.cause}`,
        type: formData.caseType as CaseType,
        cause: formData.cause,
        court: formData.court,
        amount: Number(formData.amount) || 0,
        clientId,
        clientName: formData.clientName,
        oppositeParty: formData.oppositePartyName,
        description: formData.description,
        evidenceSummary: formData.evidenceSummary,
        conflictCheckResult: conflictStatus === 'pass' ? 'pass' : conflictStatus === 'fail' ? 'fail' : 'pending',
        status: 'pending',
      });

      alert('草稿保存成功');
      navigate('/cases');
    } catch (error) {
      console.error('保存草稿失败:', error);
      alert('保存草稿失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const sectionIndex = getSectionIndexByField(firstErrorField as keyof FormData);
        setActiveSection(sectionIndex);
      }
      return;
    }

    if (conflictStatus === 'pending') {
      alert('请先进行利益冲突检索');
      setActiveSection(3);
      return;
    }

    if (conflictStatus === 'fail') {
      if (!window.confirm('存在利益冲突，确定要提交审批吗？')) {
        return;
      }
    }

    try {
      setSubmitting(true);

      let clientId = '';
      try {
        const newClient = await clientService.create({
          name: formData.clientName,
          type: formData.clientType,
          phone: formData.phone,
          email: formData.email || undefined,
          address: formData.address || undefined,
          contactPerson: formData.contactPerson || undefined,
        });
        clientId = newClient.id;
      } catch {
        clientId = generateId();
      }

      await caseService.create({
        name: `${formData.clientName} - ${formData.cause}`,
        type: formData.caseType as CaseType,
        cause: formData.cause,
        court: formData.court,
        amount: Number(formData.amount) || 0,
        clientId,
        clientName: formData.clientName,
        oppositeParty: formData.oppositePartyName,
        description: formData.description,
        evidenceSummary: formData.evidenceSummary,
        conflictCheckResult: conflictStatus === 'pass' ? 'pass' : 'fail',
        status: 'intake',
      });

      alert('提交审批成功');
      navigate('/cases');
    } catch (error) {
      console.error('提交审批失败:', error);
      alert('提交审批失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getSectionIndexByField = (field: keyof FormData): number => {
    const clientFields: (keyof FormData)[] = ['clientType', 'clientName', 'contactPerson', 'phone', 'email', 'address'];
    const oppositeFields: (keyof FormData)[] = ['oppositePartyName', 'oppositePartyType', 'oppositePartyContact'];
    const caseFields: (keyof FormData)[] = ['caseType', 'cause', 'court', 'amount', 'description', 'evidenceSummary'];

    if (clientFields.includes(field)) return 0;
    if (oppositeFields.includes(field)) return 1;
    if (caseFields.includes(field)) return 2;
    return 0;
  };

  const handleBack = () => {
    navigate('/cases');
  };

  const getConflictStatusInfo = () => {
    switch (conflictStatus) {
      case 'checking':
        return {
          icon: RefreshCw,
          text: '检索中...',
          color: 'text-primary-600',
          bgColor: 'bg-primary-50',
          borderColor: 'border-primary-200',
          iconBg: 'bg-primary-500',
        };
      case 'pass':
        return {
          icon: ShieldCheck,
          text: '未发现利益冲突',
          color: 'text-success-600',
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          iconBg: 'bg-success-500',
        };
      case 'fail':
        return {
          icon: ShieldX,
          text: '发现利益冲突',
          color: 'text-danger-600',
          bgColor: 'bg-danger-50',
          borderColor: 'border-danger-200',
          iconBg: 'bg-danger-500',
        };
      default:
        return {
          icon: ShieldAlert,
          text: '未检索',
          color: 'text-neutral-500',
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          iconBg: 'bg-neutral-400',
        };
    }
  };

  const statusInfo = getConflictStatusInfo();
  const StatusIcon = statusInfo.icon;

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
        <span className="text-neutral-700">收案登记</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="page-title">收案登记</h1>
            <p className="text-sm text-neutral-500 mt-1">登记新案件信息，进行利益冲突检索后提交审批</p>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <div className="card sticky top-6">
            <div className="space-y-1">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === index;
                const isCompleted = activeSection > index;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                        isActive
                          ? 'bg-primary-500 text-white'
                          : isCompleted
                          ? 'bg-success-500 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-primary-700' : 'text-neutral-700'
                      )}>
                        {section.title}
                      </p>
                    </div>
                    <Icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isActive ? 'text-primary-500' : 'text-neutral-400'
                    )} />
                  </button>
                );
              })}
            </div>

            <div className="divider" />

            <div className={cn(
              'p-3 rounded-lg border',
              statusInfo.bgColor,
              statusInfo.borderColor
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', statusInfo.iconBg)}>
                  <StatusIcon className={cn('w-3.5 h-3.5 text-white', conflictStatus === 'checking' && 'animate-spin')} />
                </div>
                <span className={cn('text-sm font-medium', statusInfo.color)}>
                  {statusInfo.text}
                </span>
              </div>
              {conflictStatus === 'fail' && conflicts.length > 0 && (
                <p className="text-xs text-danger-600">
                  发现 {conflicts.length} 项冲突
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeSection === 0 && (
            <div className="card animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary-50 rounded-md flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-500" />
                </div>
                <h2 className="section-title mb-0">客户信息</h2>
              </div>

              <div className="mb-6">
                <label className="label-text block mb-2">客户类型</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('clientType', 'enterprise')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200',
                      formData.clientType === 'enterprise'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">企业客户</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('clientType', 'individual')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200',
                      formData.clientType === 'individual'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">个人客户</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label-text">客户名称 <span className="text-danger-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      placeholder={formData.clientType === 'enterprise' ? '请输入企业名称' : '请输入个人姓名'}
                      className={cn(
                        'input-field pl-10',
                        errors.clientName && 'border-danger-400 focus:ring-danger-500'
                      )}
                    />
                  </div>
                  {errors.clientName && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.clientName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-text">
                    {formData.clientType === 'enterprise' ? '法定代表人' : '联系人'}
                    <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="请输入姓名"
                      className={cn(
                        'input-field pl-10',
                        errors.contactPerson && 'border-danger-400 focus:ring-danger-500'
                      )}
                    />
                  </div>
                  {errors.contactPerson && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.contactPerson}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-text">联系电话 <span className="text-danger-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="请输入联系电话"
                      className={cn(
                        'input-field pl-10',
                        errors.phone && 'border-danger-400 focus:ring-danger-500'
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-text">电子邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="请输入电子邮箱"
                      className={cn(
                        'input-field pl-10',
                        errors.email && 'border-danger-400 focus:ring-danger-500'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">联系地址</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="请输入详细地址"
                      rows={2}
                      className="input-field pl-10 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setActiveSection(1)}
                  className="btn-primary flex items-center gap-2"
                >
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div className="card animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-danger-50 rounded-md flex items-center justify-center">
                  <User className="w-4 h-4 text-danger-500" />
                </div>
                <h2 className="section-title mb-0">对方当事人</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label-text">对方当事人名称 <span className="text-danger-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.oppositePartyName}
                      onChange={(e) => handleInputChange('oppositePartyName', e.target.value)}
                      placeholder="请输入对方当事人名称"
                      className={cn(
                        'input-field pl-10',
                        errors.oppositePartyName && 'border-danger-400 focus:ring-danger-500'
                      )}
                    />
                  </div>
                  {errors.oppositePartyName && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.oppositePartyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-text">对方类型</label>
                  <select
                    value={formData.oppositePartyType}
                    onChange={(e) => handleInputChange('oppositePartyType', e.target.value)}
                    className="select-field"
                  >
                    <option value="enterprise">企业</option>
                    <option value="individual">个人</option>
                    <option value="government">政府机关</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="label-text">联系方式</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.oppositePartyContact}
                      onChange={(e) => handleInputChange('oppositePartyContact', e.target.value)}
                      placeholder="请输入联系方式（选填）"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setActiveSection(0)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一步
                </button>
                <button
                  onClick={() => setActiveSection(2)}
                  className="btn-primary flex items-center gap-2"
                >
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="card animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary-50 rounded-md flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary-500" />
                </div>
                <h2 className="section-title mb-0">案件信息</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">案件类型 <span className="text-danger-500">*</span></label>
                  <select
                    value={formData.caseType}
                    onChange={(e) => handleInputChange('caseType', e.target.value)}
                    className={cn(
                      'select-field',
                      errors.caseType && 'border-danger-400 focus:ring-danger-500'
                    )}
                  >
                    <option value="">请选择案件类型</option>
                    {Object.entries(CASE_TYPE_MAP).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  {errors.caseType && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.caseType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-text">案由 <span className="text-danger-500">*</span></label>
                  <select
                    value={formData.cause}
                    onChange={(e) => handleInputChange('cause', e.target.value)}
                    className={cn(
                      'select-field',
                      errors.cause && 'border-danger-400 focus:ring-danger-500'
                    )}
                  >
                    <option value="">请选择案由</option>
                    {CAUSE_LIST.map((cause) => (
                      <option key={cause} value={cause}>{cause}</option>
                    ))}
                  </select>
                  {errors.cause && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.cause}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-text">管辖法院 <span className="text-danger-500">*</span></label>
                  <select
                    value={formData.court}
                    onChange={(e) => handleInputChange('court', e.target.value)}
                    className={cn(
                      'select-field',
                      errors.court && 'border-danger-400 focus:ring-danger-500'
                    )}
                  >
                    <option value="">请选择管辖法院</option>
                    {COURT_LIST.map((court) => (
                      <option key={court} value={court}>{court}</option>
                    ))}
                  </select>
                  {errors.court && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.court}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-text">涉案金额（元） <span className="text-danger-500">*</span></label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="请输入涉案金额"
                      min="0"
                      step="0.01"
                      className={cn(
                        'input-field pl-10',
                        errors.amount && 'border-danger-400 focus:ring-danger-500'
                      )}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-danger-500 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">案情描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="请简要描述案件情况..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-text">证据概况</label>
                  <textarea
                    value={formData.evidenceSummary}
                    onChange={(e) => handleInputChange('evidenceSummary', e.target.value)}
                    placeholder="请简述现有证据情况..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setActiveSection(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一步
                </button>
                <button
                  onClick={() => setActiveSection(3)}
                  className="btn-primary flex items-center gap-2"
                >
                  下一步：利益冲突检索
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="card animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <div className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center',
                  conflictStatus === 'fail' ? 'bg-danger-50' : 'bg-warning-50'
                )}>
                  <Gavel className={cn(
                    'w-4 h-4',
                    conflictStatus === 'fail' ? 'text-danger-500' : 'text-warning-500'
                  )} />
                </div>
                <h2 className="section-title mb-0">利益冲突检索</h2>
              </div>

              <div className={cn(
                'p-4 rounded-lg border-2 mb-6',
                statusInfo.bgColor,
                statusInfo.borderColor
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                    statusInfo.iconBg
                  )}>
                    <StatusIcon className={cn(
                      'w-6 h-6 text-white',
                      conflictStatus === 'checking' && 'animate-spin'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn('text-lg font-semibold mb-1', statusInfo.color)}>
                      {statusInfo.text}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      {conflictStatus === 'pending' && '请点击下方按钮进行利益冲突检索，确保案件符合律所收案规范'}
                      {conflictStatus === 'checking' && '正在检索历史案件数据，请稍候...'}
                      {conflictStatus === 'pass' && '经检索，未发现与现有案件存在利益冲突，可以正常收案'}
                      {conflictStatus === 'fail' && `经检索，发现 ${conflicts.length} 项利益冲突，请审慎评估后决定是否收案`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-warning-700 mb-1">合规提示</h4>
                    <p className="text-xs text-warning-600 leading-relaxed">
                      根据《律师法》及律所执业规范，律师承办业务前必须进行利益冲突检索。
                      如发现存在利益冲突，不得接受委托；特殊情况下需经审批并取得委托人书面同意后方可接受委托。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleCheckConflict}
                  disabled={conflictStatus === 'checking'}
                  className={cn(
                    'btn-primary flex items-center gap-2',
                    conflictStatus === 'checking' && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {conflictStatus === 'checking' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldAlert className="w-4 h-4" />
                  )}
                  {conflictStatus === 'checking' ? '检索中...' : conflictStatus === 'pending' ? '开始检索' : '重新检索'}
                </button>
                <span className="text-sm text-neutral-500">
                  检索范围：本所全部历史案件
                </span>
              </div>

              {conflicts.length > 0 && (
                <div className="border border-danger-200 rounded-lg overflow-hidden">
                  <div className="bg-danger-50 px-4 py-3 border-b border-danger-200">
                    <h4 className="text-sm font-medium text-danger-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      冲突详情（{conflicts.length} 项）
                    </h4>
                  </div>
                  <ul className="divide-y divide-danger-100">
                    {conflicts.map((conflict, index) => (
                      <li
                        key={index}
                        className="px-4 py-3 text-sm text-danger-700 bg-danger-50/30 flex items-start gap-2"
                      >
                        <XCircle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                        <span>{conflict}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between mt-6 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setActiveSection(2)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一步
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={submitting}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    保存草稿
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    提交审批
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                <span className="text-danger-500">*</span> 为必填项，请确保信息填写完整准确
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存草稿
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  提交审批
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseNew;
