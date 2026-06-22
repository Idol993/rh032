import { 
  CaseStatus, 
  CaseType, 
  CasePhase, 
  DocumentStatus,
  DeadlineLevel,
  DeadlineType,
  PaymentType,
  PaymentStatus,
  PaymentStage,
  RiskLevel,
  RiskType,
  RiskStatus,
  UserRole,
  CloseCaseResult
} from '@/types';

export type ArchiveStatus = 'pending' | 'archived' | 'borrowed';

export const CASE_STATUS_MAP: Record<CaseStatus, { label: string; color: string }> = {
  pending: { label: '待收案', color: 'badge-neutral' },
  intake: { label: '收案中', color: 'badge-primary' },
  accepted: { label: '已收案', color: 'badge-primary' },
  assigned: { label: '已分案', color: 'badge-primary' },
  in_progress: { label: '办理中', color: 'badge-warning' },
  trial: { label: '审理中', color: 'badge-warning' },
  judgment: { label: '已判决', color: 'badge-success' },
  closed: { label: '已结案', color: 'badge-success' },
  archived: { label: '已归档', color: 'badge-neutral' },
};

export const CASE_TYPE_MAP: Record<CaseType, string> = {
  civil: '民事案件',
  criminal: '刑事案件',
  administrative: '行政案件',
  commercial: '商事案件',
  labor: '劳动案件',
  other: '其他案件',
};

export const CASE_PHASE_MAP: Record<CasePhase, string> = {
  intake: '收案阶段',
  pre_trial: '庭前阶段',
  trial: '审理阶段',
  judgment: '判决阶段',
  enforcement: '执行阶段',
  closed: '已结案',
};

export const DOCUMENT_STATUS_MAP: Record<DocumentStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'badge-neutral' },
  reviewing: { label: '审批中', color: 'badge-warning' },
  approved: { label: '已通过', color: 'badge-success' },
  rejected: { label: '已退回', color: 'badge-danger' },
};

export const ARCHIVE_STATUS_MAP: Record<ArchiveStatus, { label: string; color: string }> = {
  pending: { label: '待归档', color: 'badge-warning' },
  archived: { label: '已归档', color: 'badge-success' },
  borrowed: { label: '借阅中', color: 'badge-primary' },
};

export const DEADLINE_LEVEL_MAP: Record<DeadlineLevel, { label: string; color: string }> = {
  normal: { label: '正常', color: 'badge-success' },
  warning: { label: '预警', color: 'badge-warning' },
  urgent: { label: '紧急', color: 'badge-danger' },
  overdue: { label: '已逾期', color: 'badge-danger' },
};

export const DEADLINE_TYPE_MAP: Record<DeadlineType, string> = {
  lawsuit: '诉讼时效',
  evidence: '举证期限',
  defense: '答辩期',
  appeal: '上诉期',
  announcement: '公告期',
  enforcement: '申请执行期',
  other: '其他',
};

export const PAYMENT_TYPE_MAP: Record<PaymentType, string> = {
  fixed: '固定收费',
  proportion: '按比例收费',
  risk: '风险代理',
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; color: string }> = {
  unpaid: { label: '未支付', color: 'badge-danger' },
  partial: { label: '部分支付', color: 'badge-warning' },
  paid: { label: '已支付', color: 'badge-success' },
  refunded: { label: '已退款', color: 'badge-neutral' },
};

export const PAYMENT_STAGE_MAP: Record<PaymentStage, string> = {
  intake: '收案阶段',
  pre_trial: '庭前阶段',
  trial: '审理阶段',
  judgment: '判决阶段',
  enforcement: '执行阶段',
};

export const RISK_LEVEL_MAP: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: '低风险', color: 'badge-success' },
  medium: { label: '中风险', color: 'badge-warning' },
  high: { label: '高风险', color: 'badge-danger' },
  critical: { label: '严重', color: 'badge-danger' },
};

export const RISK_TYPE_MAP: Record<RiskType, string> = {
  complaint: '客户投诉',
  fee_dispute: '费用异议',
  major_risk: '重大风险',
  lawyer_change: '律师变更',
  delay: '延期开庭',
  deadline_overdue: '时限逾期',
  other: '其他',
};

export const RISK_STATUS_MAP: Record<RiskStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'badge-warning' },
  processing: { label: '处理中', color: 'badge-primary' },
  resolved: { label: '已解决', color: 'badge-success' },
  closed: { label: '已关闭', color: 'badge-neutral' },
};

export const CLOSE_CASE_RESULT_MAP: Record<CloseCaseResult, string> = {
  win: '胜诉',
  mediation: '调解',
  lose: '败诉',
  withdraw: '撤诉',
  other: '其他',
};

export const ROLE_MAP: Record<UserRole, { label: string; color: string }> = {
  client: { label: '客户', color: 'badge-neutral' },
  assistant: { label: '律师助理', color: 'badge-primary' },
  lawyer: { label: '执业律师', color: 'badge-primary' },
  partner: { label: '合伙人', color: 'badge-warning' },
  director: { label: '律所主任', color: 'badge-danger' },
};

export const DOCUMENT_TEMPLATE_LIST = [
  { id: 'civil_complaint', name: '民事起诉状', type: 'civil' },
  { id: 'civil_defense', name: '民事答辩状', type: 'civil' },
  { id: 'agency_statement', name: '代理词', type: 'civil' },
  { id: 'evidence_list', name: '证据目录', type: 'civil' },
  { id: 'lawsuit_letter', name: '律师函', type: 'civil' },
  { id: 'interview_record', name: '谈话笔录', type: 'civil' },
  { id: 'criminal_defense', name: '刑事辩护词', type: 'criminal' },
  { id: 'administrative_complaint', name: '行政起诉状', type: 'administrative' },
  { id: 'labor_arbitration', name: '劳动仲裁申请书', type: 'labor' },
  { id: 'power_of_attorney', name: '授权委托书', type: 'other' },
  { id: 'contract_template', name: '委托合同', type: 'other' },
  { id: 'risk_disclosure', name: '风险告知书', type: 'other' },
];

export const COURT_LIST = [
  '北京市朝阳区人民法院',
  '北京市海淀区人民法院',
  '北京市西城区人民法院',
  '北京市东城区人民法院',
  '上海市浦东新区人民法院',
  '广州市天河区人民法院',
  '深圳市南山区人民法院',
  '杭州市西湖区人民法院',
  '南京市鼓楼区人民法院',
  '成都市武侯区人民法院',
];

export const CAUSE_LIST = [
  '买卖合同纠纷',
  '借款合同纠纷',
  '租赁合同纠纷',
  '劳动合同纠纷',
  '股权转让纠纷',
  '侵权责任纠纷',
  '婚姻家庭纠纷',
  '继承纠纷',
  '知识产权纠纷',
  '建设工程合同纠纷',
  '物业服务合同纠纷',
  '交通事故责任纠纷',
];

export const SIDEBAR_MENU = [
  {
    key: 'dashboard',
    label: '工作台',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    roles: ['assistant', 'lawyer', 'partner', 'director'] as UserRole[],
  },
  {
    key: 'cases',
    label: '案件管理',
    icon: 'Briefcase',
    path: '/cases',
    roles: ['assistant', 'lawyer', 'partner', 'director'] as UserRole[],
    children: [
      { key: 'case-list', label: '案件列表', path: '/cases' },
      { key: 'case-new', label: '收案登记', path: '/cases/new' },
      { key: 'case-assign', label: '分案管理', path: '/cases/assign' },
    ],
  },
  {
    key: 'clients',
    label: '客户管理',
    icon: 'Users',
    path: '/clients',
    roles: ['assistant', 'lawyer', 'partner', 'director'] as UserRole[],
  },
  {
    key: 'documents',
    label: '文书中心',
    icon: 'FileText',
    path: '/documents',
    roles: ['assistant', 'lawyer', 'partner', 'director'] as UserRole[],
  },
  {
    key: 'finance',
    label: '费用中心',
    icon: 'Wallet',
    path: '/finance',
    roles: ['partner', 'director'] as UserRole[],
    children: [
      { key: 'fee-list', label: '收费管理', path: '/finance' },
      { key: 'invoice', label: '开票管理', path: '/finance/invoice' },
    ],
  },
  {
    key: 'risk',
    label: '风控中心',
    icon: 'ShieldAlert',
    path: '/risk/deadlines',
    roles: ['assistant', 'lawyer', 'partner', 'director'] as UserRole[],
    children: [
      { key: 'deadlines', label: '时限监控', path: '/risk/deadlines' },
      { key: 'tickets', label: '风险工单', path: '/risk/tickets' },
    ],
  },
  {
    key: 'judicial',
    label: '司法数据',
    icon: 'Building2',
    path: '/judicial',
    roles: ['assistant', 'lawyer', 'partner', 'director'] as UserRole[],
  },
  {
    key: 'archive',
    label: '卷宗管理',
    icon: 'Archive',
    path: '/archive',
    roles: ['assistant', 'lawyer', 'partner', 'director'] as UserRole[],
  },
  {
    key: 'analytics',
    label: '经营大屏',
    icon: 'BarChart3',
    path: '/analytics',
    roles: ['partner', 'director'] as UserRole[],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'Settings',
    path: '/system/users',
    roles: ['director'] as UserRole[],
    children: [
      { key: 'users', label: '用户管理', path: '/system/users' },
      { key: 'logs', label: '操作日志', path: '/system/logs' },
    ],
  },
];

export const STORAGE_KEYS = {
  USERS: 'legal_platform_users',
  CASES: 'legal_platform_cases',
  CLIENTS: 'legal_platform_clients',
  DOCUMENTS: 'legal_platform_documents',
  DEADLINES: 'legal_platform_deadlines',
  PAYMENTS: 'legal_platform_payments',
  RISK_TICKETS: 'legal_platform_risk_tickets',
  OPERATION_LOGS: 'legal_platform_operation_logs',
  CASE_LOGS: 'legal_platform_case_logs',
  ARCHIVES: 'legal_platform_archives',
  JUDICIAL_DATA: 'legal_platform_judicial_data',
  CURRENT_USER: 'legal_platform_current_user',
};
