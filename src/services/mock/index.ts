import { STORAGE_KEYS } from '@/constants';
import { User, Client, Case, Document, Deadline, Payment, RiskTicket, JudicialData, OperationLog, Archive } from '@/types';
import { generateId, formatDate, addDays, generateCaseNo, generateInvoiceNo, getDeadlineLevel, calculateRemainingDays } from '@/utils';

function getFromStorage<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item);
  }
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const mockUsers: User[] = [
  {
    id: 'user_001',
    name: '张明远',
    role: 'director',
    licenseNo: '110101199001010001',
    phone: '13800000001',
    email: 'zhangmy@lawfirm.com',
    avatar: '',
    expertise: ['公司法', '并购重组', '资本市场'],
    caseLoad: 5,
    winRate: 85,
    status: 'active',
    department: '管委会',
    createdAt: '2023-01-15T08:00:00Z',
  },
  {
    id: 'user_002',
    name: '李建国',
    role: 'partner',
    licenseNo: '110101199001010002',
    phone: '13800000002',
    email: 'lijg@lawfirm.com',
    avatar: '',
    expertise: ['民事诉讼', '合同纠纷', '公司法务'],
    caseLoad: 12,
    winRate: 78,
    status: 'active',
    department: '民商诉讼部',
    createdAt: '2023-02-20T08:00:00Z',
  },
  {
    id: 'user_003',
    name: '王律师',
    role: 'lawyer',
    licenseNo: '110101199001010003',
    phone: '13800000003',
    email: 'wangls@lawfirm.com',
    avatar: '',
    expertise: ['合同纠纷', '债权债务', '劳动争议'],
    caseLoad: 8,
    winRate: 72,
    status: 'active',
    department: '民商诉讼部',
    createdAt: '2023-06-10T08:00:00Z',
  },
  {
    id: 'user_004',
    name: '陈律师',
    role: 'lawyer',
    licenseNo: '110101199001010004',
    phone: '13800000004',
    email: 'chenls@lawfirm.com',
    avatar: '',
    expertise: ['知识产权', '竞争法', '商标专利'],
    caseLoad: 6,
    winRate: 80,
    status: 'active',
    department: '知识产权部',
    createdAt: '2023-08-15T08:00:00Z',
  },
  {
    id: 'user_005',
    name: '刘小助',
    role: 'assistant',
    phone: '13800000005',
    email: 'liuxz@lawfirm.com',
    avatar: '',
    status: 'active',
    department: '民商诉讼部',
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'user_006',
    name: '赵小助',
    role: 'assistant',
    phone: '13800000006',
    email: 'zhaoxz@lawfirm.com',
    avatar: '',
    status: 'active',
    department: '知识产权部',
    createdAt: '2024-03-15T08:00:00Z',
  },
];

export const mockClients: Client[] = [
  {
    id: 'client_001',
    name: '北京宏达科技有限公司',
    type: 'enterprise',
    creditCode: '91110108MA01ABCD12',
    phone: '010-88888888',
    email: 'contact@hongda.com',
    address: '北京市海淀区中关村大街1号',
    industry: '互联网/科技',
    contactPerson: '张总',
    remark: '重要客户，长期合作',
    createdAt: '2023-03-10T08:00:00Z',
  },
  {
    id: 'client_002',
    name: '上海鼎盛贸易有限公司',
    type: 'enterprise',
    creditCode: '91310115MA1ABCDE34',
    phone: '021-66666666',
    email: 'info@dingsheng.com',
    address: '上海市浦东新区陆家嘴金融中心58号',
    industry: '贸易/进出口',
    contactPerson: '李经理',
    remark: '',
    createdAt: '2023-05-20T08:00:00Z',
  },
  {
    id: 'client_003',
    name: '王伟',
    type: 'individual',
    idCard: '110101199001010011',
    phone: '13900000001',
    email: 'wangwei@email.com',
    address: '北京市朝阳区建国路88号',
    remark: '个人客户',
    createdAt: '2023-07-15T08:00:00Z',
  },
  {
    id: 'client_004',
    name: '深圳创新电子有限公司',
    type: 'enterprise',
    creditCode: '91440300MA5ABCDE56',
    phone: '0755-88888888',
    email: 'legal@chuangxin.com',
    address: '深圳市南山区科技园南区',
    industry: '电子/制造',
    contactPerson: '法务部刘经理',
    remark: '新客户，潜力较大',
    createdAt: '2023-09-10T08:00:00Z',
  },
  {
    id: 'client_005',
    name: '李娜',
    type: 'individual',
    idCard: '110101199205050022',
    phone: '13900000002',
    email: 'lina@email.com',
    address: '北京市西城区金融街1号',
    remark: '劳动争议案件',
    createdAt: '2024-01-05T08:00:00Z',
  },
];

export const mockCases: Case[] = [
  {
    id: 'case_001',
    caseNo: generateCaseNo(),
    name: '北京宏达科技有限公司买卖合同纠纷',
    type: 'commercial',
    cause: '买卖合同纠纷',
    court: '北京市朝阳区人民法院',
    judge: '王法官',
    amount: 580000,
    status: 'trial',
    phase: 'trial',
    clientId: 'client_001',
    clientName: '北京宏达科技有限公司',
    oppositeParty: '天津某建材公司',
    lawyerId: 'user_003',
    lawyerName: '王律师',
    partnerId: 'user_002',
    partnerName: '李建国',
    assistantId: 'user_005',
    assistantName: '刘小助',
    evidenceSummary: '合同原件、送货单、对账单、催款函等',
    description: '原告北京宏达科技有限公司与被告天津某建材公司签订买卖合同，原告供货后被告未支付货款，经多次催要未果。',
    conflictCheckResult: 'pass',
    createdAt: '2024-02-15T09:00:00Z',
    acceptedAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'case_002',
    caseNo: generateCaseNo(),
    name: '王伟劳动争议案',
    type: 'labor',
    cause: '劳动合同纠纷',
    court: '北京市海淀区劳动人事争议仲裁委员会',
    amount: 280000,
    status: 'in_progress',
    phase: 'pre_trial',
    clientId: 'client_003',
    clientName: '王伟',
    oppositeParty: '北京某互联网公司',
    lawyerId: 'user_003',
    lawyerName: '王律师',
    partnerId: 'user_002',
    partnerName: '李建国',
    assistantId: 'user_005',
    assistantName: '刘小助',
    evidenceSummary: '劳动合同、工资流水、加班记录、解除通知等',
    description: '申请人王伟因公司违法解除劳动合同，要求支付经济赔偿金及加班工资。',
    conflictCheckResult: 'pass',
    createdAt: '2024-03-01T09:00:00Z',
    acceptedAt: '2024-03-05T09:00:00Z',
  },
  {
    id: 'case_003',
    caseNo: generateCaseNo(),
    name: '上海鼎盛贸易有限公司股权纠纷案',
    type: 'commercial',
    cause: '股权转让纠纷',
    court: '上海市浦东新区人民法院',
    judge: '李法官',
    amount: 2500000,
    status: 'accepted',
    phase: 'intake',
    clientId: 'client_002',
    clientName: '上海鼎盛贸易有限公司',
    oppositeParty: '某投资控股公司',
    lawyerId: 'user_002',
    lawyerName: '李建国',
    partnerId: 'user_002',
    partnerName: '李建国',
    assistantId: 'user_005',
    assistantName: '刘小助',
    evidenceSummary: '股权转让协议、付款凭证、股东会决议等',
    description: '原告上海鼎盛贸易有限公司与被告签订股权转让协议后，被告未按约定支付股权转让款。',
    conflictCheckResult: 'pass',
    createdAt: '2024-04-10T09:00:00Z',
    acceptedAt: '2024-04-15T09:00:00Z',
  },
  {
    id: 'case_004',
    caseNo: generateCaseNo(),
    name: '深圳创新电子专利侵权案',
    type: 'civil',
    cause: '知识产权纠纷',
    court: '深圳市中级人民法院',
    judge: '陈法官',
    amount: 1200000,
    status: 'in_progress',
    phase: 'pre_trial',
    clientId: 'client_004',
    clientName: '深圳创新电子有限公司',
    oppositeParty: '东莞某电子厂',
    lawyerId: 'user_004',
    lawyerName: '陈律师',
    partnerId: 'user_001',
    partnerName: '张明远',
    assistantId: 'user_006',
    assistantName: '赵小助',
    evidenceSummary: '专利证书、侵权产品、比对报告等',
    description: '原告深圳创新电子有限公司发现被告生产销售的产品侵犯其专利权，要求停止侵权并赔偿损失。',
    conflictCheckResult: 'pass',
    createdAt: '2024-01-20T09:00:00Z',
    acceptedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: 'case_005',
    caseNo: generateCaseNo(),
    name: '李娜劳动争议案',
    type: 'labor',
    cause: '劳动合同纠纷',
    court: '北京市西城区劳动人事争议仲裁委员会',
    amount: 150000,
    status: 'judgment',
    phase: 'judgment',
    clientId: 'client_005',
    clientName: '李娜',
    oppositeParty: '北京某金融公司',
    lawyerId: 'user_003',
    lawyerName: '王律师',
    partnerId: 'user_002',
    partnerName: '李建国',
    assistantId: 'user_005',
    assistantName: '刘小助',
    evidenceSummary: '劳动合同、绩效考核表、辞退通知等',
    description: '申请人李娜因公司以绩效考核不达标为由辞退，要求支付违法解除劳动合同赔偿金。',
    conflictCheckResult: 'pass',
    createdAt: '2023-11-10T09:00:00Z',
    acceptedAt: '2023-11-15T09:00:00Z',
  },
  {
    id: 'case_006',
    caseNo: generateCaseNo(),
    name: '某建筑公司建设工程合同纠纷案',
    type: 'civil',
    cause: '建设工程合同纠纷',
    court: '北京市第三中级人民法院',
    judge: '刘法官',
    amount: 8500000,
    status: 'closed',
    phase: 'closed',
    clientId: 'client_001',
    clientName: '北京宏达科技有限公司',
    oppositeParty: '某建筑工程公司',
    lawyerId: 'user_002',
    lawyerName: '李建国',
    partnerId: 'user_002',
    partnerName: '李建国',
    assistantId: 'user_005',
    assistantName: '刘小助',
    evidenceSummary: '建设工程合同、竣工验收报告、结算书等',
    description: '原告与被告签订建设工程施工合同，工程竣工后被告拖欠工程款。',
    conflictCheckResult: 'pass',
    createdAt: '2023-06-01T09:00:00Z',
    acceptedAt: '2023-06-05T09:00:00Z',
    closeAt: '2024-03-20T09:00:00Z',
  },
  {
    id: 'case_007',
    caseNo: generateCaseNo(),
    name: '某科技公司融资法律顾问',
    type: 'other',
    cause: '非诉讼法律服务',
    court: '',
    amount: 500000,
    status: 'in_progress',
    phase: 'pre_trial',
    clientId: 'client_004',
    clientName: '深圳创新电子有限公司',
    oppositeParty: '',
    lawyerId: 'user_001',
    lawyerName: '张明远',
    partnerId: 'user_001',
    partnerName: '张明远',
    assistantId: 'user_006',
    assistantName: '赵小助',
    description: '为客户A轮融资提供全程法律服务，包括尽职调查、交易结构设计、文件起草等。',
    conflictCheckResult: 'pass',
    createdAt: '2024-04-01T09:00:00Z',
    acceptedAt: '2024-04-05T09:00:00Z',
  },
  {
    id: 'case_008',
    caseNo: generateCaseNo(),
    name: '交通事故责任纠纷案',
    type: 'civil',
    cause: '交通事故责任纠纷',
    court: '北京市朝阳区人民法院',
    amount: 320000,
    status: 'pending',
    phase: 'intake',
    clientId: 'client_003',
    clientName: '王伟',
    oppositeParty: '张某、某保险公司',
    evidenceSummary: '交通事故认定书、医疗记录、伤残鉴定报告等',
    description: '原告因交通事故受伤，要求被告赔偿医疗费、误工费、伤残赔偿金等。',
    conflictCheckResult: 'pending',
    createdAt: '2024-04-18T09:00:00Z',
  },
];

export const mockDeadlines: Deadline[] = [
  {
    id: 'deadline_001',
    caseId: 'case_001',
    caseName: '北京宏达科技有限公司买卖合同纠纷',
    type: 'evidence',
    name: '举证期限届满',
    deadline: formatDate(addDays(new Date(), 12)),
    remainingDays: 12,
    level: 'normal',
    status: 'pending',
    notifiedLawyer: false,
    notifiedPartner: false,
    notifiedDirector: false,
    createdAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'deadline_002',
    caseId: 'case_001',
    caseName: '北京宏达科技有限公司买卖合同纠纷',
    type: 'defense',
    name: '答辩期届满',
    deadline: formatDate(addDays(new Date(), 5)),
    remainingDays: 5,
    level: 'warning',
    status: 'pending',
    notifiedLawyer: true,
    notifiedPartner: false,
    notifiedDirector: false,
    createdAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'deadline_003',
    caseId: 'case_002',
    caseName: '王伟劳动争议案',
    type: 'evidence',
    name: '仲裁举证期限',
    deadline: formatDate(addDays(new Date(), 2)),
    remainingDays: 2,
    level: 'urgent',
    status: 'pending',
    notifiedLawyer: true,
    notifiedPartner: true,
    notifiedDirector: false,
    createdAt: '2024-03-05T09:00:00Z',
  },
  {
    id: 'deadline_004',
    caseId: 'case_004',
    caseName: '深圳创新电子专利侵权案',
    type: 'evidence',
    name: '证据交换',
    deadline: formatDate(addDays(new Date(), 20)),
    remainingDays: 20,
    level: 'normal',
    status: 'pending',
    notifiedLawyer: false,
    notifiedPartner: false,
    notifiedDirector: false,
    createdAt: '2024-01-25T09:00:00Z',
  },
  {
    id: 'deadline_005',
    caseId: 'case_005',
    caseName: '李娜劳动争议案',
    type: 'appeal',
    name: '上诉期',
    deadline: formatDate(addDays(new Date(), -3)),
    remainingDays: -3,
    level: 'overdue',
    status: 'pending',
    notifiedLawyer: true,
    notifiedPartner: true,
    notifiedDirector: true,
    createdAt: '2023-11-15T09:00:00Z',
  },
  {
    id: 'deadline_006',
    caseId: 'case_003',
    caseName: '上海鼎盛贸易有限公司股权纠纷案',
    type: 'defense',
    name: '管辖异议期',
    deadline: formatDate(addDays(new Date(), 8)),
    remainingDays: 8,
    level: 'normal',
    status: 'pending',
    notifiedLawyer: false,
    notifiedPartner: false,
    notifiedDirector: false,
    createdAt: '2024-04-15T09:00:00Z',
  },
];

export const mockDocuments: Document[] = [
  {
    id: 'doc_001',
    caseId: 'case_001',
    caseName: '北京宏达科技有限公司买卖合同纠纷',
    type: 'civil_complaint',
    title: '民事起诉状',
    templateId: 'civil_complaint',
    currentVersion: 3,
    status: 'approved',
    editorId: 'user_003',
    editorName: '王律师',
    createdAt: '2024-02-21T09:00:00Z',
    updatedAt: '2024-02-25T14:30:00Z',
  },
  {
    id: 'doc_002',
    caseId: 'case_001',
    caseName: '北京宏达科技有限公司买卖合同纠纷',
    type: 'evidence_list',
    title: '证据目录',
    templateId: 'evidence_list',
    currentVersion: 2,
    status: 'approved',
    editorId: 'user_005',
    editorName: '刘小助',
    createdAt: '2024-02-22T09:00:00Z',
    updatedAt: '2024-02-26T10:00:00Z',
  },
  {
    id: 'doc_003',
    caseId: 'case_002',
    caseName: '王伟劳动争议案',
    type: 'labor_arbitration',
    title: '劳动仲裁申请书',
    templateId: 'labor_arbitration',
    currentVersion: 1,
    status: 'reviewing',
    editorId: 'user_003',
    editorName: '王律师',
    createdAt: '2024-03-06T09:00:00Z',
    updatedAt: '2024-03-06T09:00:00Z',
  },
  {
    id: 'doc_004',
    caseId: 'case_004',
    caseName: '深圳创新电子专利侵权案',
    type: 'agency_statement',
    title: '代理词',
    templateId: 'agency_statement',
    currentVersion: 2,
    status: 'draft',
    editorId: 'user_004',
    editorName: '陈律师',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-15T16:00:00Z',
  },
  {
    id: 'doc_005',
    caseId: 'case_005',
    caseName: '李娜劳动争议案',
    type: 'agency_statement',
    title: '仲裁代理意见',
    templateId: 'agency_statement',
    currentVersion: 4,
    status: 'approved',
    editorId: 'user_002',
    editorName: '李建国',
    createdAt: '2023-11-20T09:00:00Z',
    updatedAt: '2023-12-05T11:00:00Z',
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'pay_001',
    caseId: 'case_001',
    caseName: '北京宏达科技有限公司买卖合同纠纷',
    clientName: '北京宏达科技有限公司',
    type: 'proportion',
    amount: 58000,
    paidAmount: 58000,
    stage: 'intake',
    status: 'paid',
    invoiceNo: 'INV2024022001',
    invoiceStatus: 'issued',
    payAt: '2024-02-20T10:00:00Z',
    remark: '首期律师费，按标的额10%收取',
    createdAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'pay_002',
    caseId: 'case_002',
    caseName: '王伟劳动争议案',
    clientName: '王伟',
    type: 'fixed',
    amount: 15000,
    paidAmount: 10000,
    stage: 'intake',
    status: 'partial',
    invoiceNo: 'INV2024030501',
    invoiceStatus: 'issued',
    payAt: '2024-03-05T10:00:00Z',
    remark: '已支付部分费用，剩余5000元开庭前支付',
    createdAt: '2024-03-05T09:00:00Z',
  },
  {
    id: 'pay_003',
    caseId: 'case_003',
    caseName: '上海鼎盛贸易有限公司股权纠纷案',
    clientName: '上海鼎盛贸易有限公司',
    type: 'risk',
    amount: 500000,
    paidAmount: 50000,
    stage: 'intake',
    status: 'partial',
    invoiceNo: '',
    invoiceStatus: 'none',
    payAt: '2024-04-15T10:00:00Z',
    remark: '风险代理，前期费用5万，胜诉后按回款20%提成',
    createdAt: '2024-04-15T09:00:00Z',
  },
  {
    id: 'pay_004',
    caseId: 'case_004',
    caseName: '深圳创新电子专利侵权案',
    clientName: '深圳创新电子有限公司',
    type: 'fixed',
    amount: 80000,
    paidAmount: 80000,
    stage: 'pre_trial',
    status: 'paid',
    invoiceNo: 'INV2024012501',
    invoiceStatus: 'issued',
    payAt: '2024-01-25T10:00:00Z',
    remark: '专利侵权案件律师费',
    createdAt: '2024-01-25T09:00:00Z',
  },
  {
    id: 'pay_005',
    caseId: 'case_006',
    caseName: '某建筑公司建设工程合同纠纷案',
    clientName: '北京宏达科技有限公司',
    type: 'proportion',
    amount: 255000,
    paidAmount: 255000,
    stage: 'judgment',
    status: 'paid',
    invoiceNo: 'INV2023060501',
    invoiceStatus: 'issued',
    payAt: '2024-03-20T10:00:00Z',
    remark: '按标的额3%收取，案件已结案',
    createdAt: '2023-06-05T09:00:00Z',
  },
  {
    id: 'pay_006',
    caseId: 'case_007',
    caseName: '某科技公司融资法律顾问',
    clientName: '深圳创新电子有限公司',
    type: 'fixed',
    amount: 500000,
    paidAmount: 200000,
    stage: 'pre_trial',
    status: 'partial',
    invoiceNo: 'INV2024040501',
    invoiceStatus: 'issued',
    payAt: '2024-04-05T10:00:00Z',
    remark: '融资法律顾问费，分三期支付',
    createdAt: '2024-04-05T09:00:00Z',
  },
];

export const mockRiskTickets: RiskTicket[] = [
  {
    id: 'ticket_001',
    caseId: 'case_005',
    caseName: '李娜劳动争议案',
    type: 'deadline_overdue',
    level: 'critical',
    title: '上诉期已超期',
    description: '李娜劳动争议案的上诉期已超期3天，未收到客户上诉指示，存在执业风险。',
    status: 'processing',
    reporterId: 'system',
    reporterName: '系统自动',
    handlerId: 'user_002',
    handlerName: '李建国',
    result: '已与客户沟通，客户决定不上诉，正在办理结案手续。',
    createdAt: '2024-04-15T09:00:00Z',
  },
  {
    id: 'ticket_002',
    caseId: 'case_002',
    caseName: '王伟劳动争议案',
    type: 'complaint',
    level: 'medium',
    title: '客户对案件进度不满',
    description: '客户王伟反映案件进展缓慢，多次询问开庭时间未得到明确答复。',
    status: 'resolved',
    reporterId: 'client_003',
    reporterName: '王伟',
    handlerId: 'user_003',
    handlerName: '王律师',
    result: '已与客户电话沟通，解释了仲裁流程和时间安排，客户表示理解。',
    createdAt: '2024-03-20T09:00:00Z',
    closeAt: '2024-03-22T16:00:00Z',
  },
  {
    id: 'ticket_003',
    caseId: 'case_003',
    caseName: '上海鼎盛贸易有限公司股权纠纷案',
    type: 'fee_dispute',
    level: 'high',
    title: '客户对风险代理收费有异议',
    description: '客户对风险代理20%的提成比例有异议，认为过高，要求调整。',
    status: 'pending',
    reporterId: 'client_002',
    reporterName: '上海鼎盛贸易有限公司',
    createdAt: '2024-04-18T09:00:00Z',
  },
];

export const mockJudicialData: JudicialData[] = [
  {
    id: 'judicial_001',
    type: 'court_notice',
    title: '北京宏达科技有限公司买卖合同纠纷开庭公告',
    court: '北京市朝阳区人民法院',
    caseNo: '(2024)京0105民初12345号',
    parties: '原告：北京宏达科技有限公司；被告：天津某建材公司',
    date: formatDate(addDays(new Date(), 15)),
    content: '定于2024年5月10日上午9时在本院第三法庭公开开庭审理原告北京宏达科技有限公司与被告天津某建材公司买卖合同纠纷一案。',
    source: '中国审判流程信息公开网',
    syncAt: formatDate(addDays(new Date(), -1)),
  },
  {
    id: 'judicial_002',
    type: 'judgment',
    title: '李娜劳动争议案一审判决书',
    court: '北京市西城区劳动人事争议仲裁委员会',
    caseNo: '京西劳人仲字[2024]第678号',
    parties: '申请人：李娜；被申请人：北京某金融公司',
    date: '2024-03-15',
    content: '裁决如下：一、被申请人支付申请人违法解除劳动合同赔偿金12万元；二、驳回申请人其他仲裁请求。',
    source: '中国裁判文书网',
    syncAt: formatDate(addDays(new Date(), -30)),
  },
  {
    id: 'judicial_003',
    type: 'service_notice',
    title: '深圳创新电子专利侵权案送达公告',
    court: '深圳市中级人民法院',
    caseNo: '(2024)粤03民初5678号',
    parties: '原告：深圳创新电子有限公司；被告：东莞某电子厂',
    date: formatDate(addDays(new Date(), -5)),
    content: '东莞某电子厂：本院受理原告深圳创新电子有限公司诉你方专利侵权纠纷一案，现依法向你方送达起诉状副本、应诉通知书及开庭传票。',
    source: '人民法院公告网',
    syncAt: formatDate(addDays(new Date(), -3)),
  },
];

export const mockOperationLogs: OperationLog[] = [
  {
    id: 'log_001',
    userId: 'user_003',
    userName: '王律师',
    module: '案件管理',
    action: '创建',
    targetId: 'case_001',
    targetName: '北京宏达科技有限公司买卖合同纠纷',
    detail: '创建新案件',
    ip: '192.168.1.100',
    createdAt: '2024-02-15T09:30:00Z',
  },
  {
    id: 'log_002',
    userId: 'user_002',
    userName: '李建国',
    module: '案件管理',
    action: '审批',
    targetId: 'case_001',
    targetName: '北京宏达科技有限公司买卖合同纠纷',
    detail: '收案审批通过',
    ip: '192.168.1.101',
    createdAt: '2024-02-20T10:15:00Z',
  },
  {
    id: 'log_003',
    userId: 'user_003',
    userName: '王律师',
    module: '文书管理',
    action: '编辑',
    targetId: 'doc_001',
    targetName: '民事起诉状',
    detail: '编辑文书版本v3',
    ip: '192.168.1.100',
    createdAt: '2024-02-25T14:30:00Z',
  },
  {
    id: 'log_004',
    userId: 'user_002',
    userName: '李建国',
    module: '文书管理',
    action: '审批',
    targetId: 'doc_001',
    targetName: '民事起诉状',
    detail: '文书审批通过',
    ip: '192.168.1.101',
    createdAt: '2024-02-26T09:00:00Z',
  },
  {
    id: 'log_005',
    userId: 'user_005',
    userName: '刘小助',
    module: '客户管理',
    action: '创建',
    targetId: 'client_005',
    targetName: '李娜',
    detail: '新建客户档案',
    ip: '192.168.1.102',
    createdAt: '2024-01-05T11:20:00Z',
  },
];

export const mockArchives: Archive[] = [
  {
    id: 'archive_001',
    caseId: 'case_006',
    caseName: '某建筑公司建设工程合同纠纷案',
    caseType: 'civil',
    clientName: '北京宏达科技有限公司',
    archiveNo: 'JD-2024-001',
    status: 'archived',
    location: '档案室A区-第3排',
    archiveAt: '2024-04-10T09:00:00Z',
    createdAt: '2024-04-01T09:00:00Z',
  },
  {
    id: 'archive_002',
    caseId: 'case_005',
    caseName: '李娜劳动争议案',
    caseType: 'labor',
    clientName: '李娜',
    archiveNo: 'JD-2024-002',
    status: 'archived',
    location: '档案室A区-第5排',
    archiveAt: '2024-03-25T09:00:00Z',
    createdAt: '2024-03-18T09:00:00Z',
  },
  {
    id: 'archive_003',
    caseId: 'case_008',
    caseName: '交通事故责任纠纷案',
    caseType: 'civil',
    clientName: '王伟',
    archiveNo: 'JD-2024-003',
    status: 'pending',
    location: '',
    archiveAt: undefined,
    createdAt: '2024-04-20T09:00:00Z',
  },
  {
    id: 'archive_004',
    caseId: 'case_001',
    caseName: '北京宏达科技有限公司买卖合同纠纷',
    caseType: 'commercial',
    clientName: '北京宏达科技有限公司',
    archiveNo: 'JD-2024-004',
    status: 'borrowed',
    location: '档案室B区-第2排',
    archiveAt: '2024-02-28T09:00:00Z',
    createdAt: '2024-02-20T09:00:00Z',
  },
  {
    id: 'archive_005',
    caseId: 'case_002',
    caseName: '王伟劳动争议案',
    caseType: 'labor',
    clientName: '王伟',
    archiveNo: 'JD-2024-005',
    status: 'pending',
    location: '',
    archiveAt: undefined,
    createdAt: '2024-04-15T09:00:00Z',
  },
  {
    id: 'archive_006',
    caseId: 'case_003',
    caseName: '上海鼎盛贸易有限公司股权纠纷案',
    caseType: 'commercial',
    clientName: '上海鼎盛贸易有限公司',
    archiveNo: 'JD-2024-006',
    status: 'archived',
    location: '档案室A区-第1排',
    archiveAt: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-08T09:00:00Z',
  },
  {
    id: 'archive_007',
    caseId: 'case_004',
    caseName: '深圳创新电子专利侵权案',
    caseType: 'civil',
    clientName: '深圳创新电子有限公司',
    archiveNo: 'JD-2024-007',
    status: 'borrowed',
    location: '档案室B区-第4排',
    archiveAt: '2024-03-10T09:00:00Z',
    createdAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 'archive_008',
    caseId: 'case_007',
    caseName: '某科技公司融资法律顾问',
    caseType: 'other',
    clientName: '深圳创新电子有限公司',
    archiveNo: 'JD-2024-008',
    status: 'pending',
    location: '',
    archiveAt: undefined,
    createdAt: '2024-04-22T09:00:00Z',
  },
];

export function initMockData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, mockUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    saveToStorage(STORAGE_KEYS.CLIENTS, mockClients);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
    saveToStorage(STORAGE_KEYS.CASES, mockCases);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEADLINES)) {
    const deadlinesWithLevel = mockDeadlines.map(d => ({
      ...d,
      remainingDays: calculateRemainingDays(d.deadline),
      level: getDeadlineLevel(calculateRemainingDays(d.deadline)),
    }));
    saveToStorage(STORAGE_KEYS.DEADLINES, deadlinesWithLevel);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
    saveToStorage(STORAGE_KEYS.DOCUMENTS, mockDocuments);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    saveToStorage(STORAGE_KEYS.PAYMENTS, mockPayments);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RISK_TICKETS)) {
    saveToStorage(STORAGE_KEYS.RISK_TICKETS, mockRiskTickets);
  }
  if (!localStorage.getItem(STORAGE_KEYS.OPERATION_LOGS)) {
    saveToStorage(STORAGE_KEYS.OPERATION_LOGS, mockOperationLogs);
  }
  if (!localStorage.getItem(STORAGE_KEYS.JUDICIAL_DATA)) {
    saveToStorage(STORAGE_KEYS.JUDICIAL_DATA, mockJudicialData);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ARCHIVES)) {
    saveToStorage(STORAGE_KEYS.ARCHIVES, mockArchives);
  }

  const docVersionsKey001 = `${STORAGE_KEYS.DOCUMENTS}_versions_doc_001`;
  if (!localStorage.getItem(docVersionsKey001)) {
    saveToStorage(docVersionsKey001, [
      {
        id: 'ver_001_3',
        docId: 'doc_001',
        version: 3,
        content: `民事起诉状

原告：北京宏达科技有限公司
住所地：北京市海淀区中关村大街1号
法定代表人：张总
联系电话：010-88888888

被告：天津某建材公司
住所地：天津市某某区某某路某某号
法定代表人：某某
联系电话：022-xxxxxxx

诉讼请求：
1. 判令被告支付货款人民币580,000元及逾期利息；
2. 判令被告承担本案全部诉讼费用。

事实与理由：
原告与被告于2023年10月签订买卖合同，约定原告向被告供应建材产品。原告依约履行供货义务后，被告未按约定支付货款。截至起诉之日，被告尚欠原告货款共计人民币580,000元。经原告多次催要，被告均以各种理由拖延。为维护原告合法权益，特向贵院提起诉讼，请求依法判如所请。

此致
北京市朝阳区人民法院

具状人：北京宏达科技有限公司
2024年2月25日`,
        editorId: 'user_003',
        editorName: '王律师',
        editNote: '补充诉讼请求和事实理由细节',
        createdAt: '2024-02-25T14:30:00Z',
      },
      {
        id: 'ver_001_2',
        docId: 'doc_001',
        version: 2,
        content: `民事起诉状

原告：北京宏达科技有限公司
住所地：北京市海淀区中关村大街1号
法定代表人：张总

被告：天津某建材公司
住所地：天津市某某区某某路某某号

诉讼请求：
1. 判令被告支付货款人民币580,000元；
2. 判令被告承担本案诉讼费用。

事实与理由：
原告与被告签订买卖合同，原告供货后被告未支付货款。经原告多次催要未果。为维护原告合法权益，特向贵院提起诉讼。

此致
北京市朝阳区人民法院

具状人：北京宏达科技有限公司
2024年2月23日`,
        editorId: 'user_003',
        editorName: '王律师',
        editNote: '完善被告信息和诉讼请求',
        createdAt: '2024-02-23T10:15:00Z',
      },
      {
        id: 'ver_001_1',
        docId: 'doc_001',
        version: 1,
        content: `民事起诉状

原告：北京宏达科技有限公司

被告：天津某建材公司

诉讼请求：
1. 支付货款

事实与理由：
买卖合同纠纷`,
        editorId: 'user_005',
        editorName: '刘小助',
        editNote: '初始版本',
        createdAt: '2024-02-21T09:00:00Z',
      },
    ]);
  }

  const docVersionsKey002 = `${STORAGE_KEYS.DOCUMENTS}_versions_doc_002`;
  if (!localStorage.getItem(docVersionsKey002)) {
    saveToStorage(docVersionsKey002, [
      {
        id: 'ver_002_2',
        docId: 'doc_002',
        version: 2,
        content: `证据目录

案号：（2024）京0105民初XXXXX号

原告：北京宏达科技有限公司
被告：天津某建材公司

序号 证据名称        证明对象                          页码
1    买卖合同原件    证明原被告之间存在合法有效的买卖合同关系    1-5
2    送货单          证明原告已按约定履行供货义务               6-12
3    对账单          证明被告确认欠款金额                     13-15
4    催款函          证明原告多次向被告催要货款                 16-18
5    付款记录        证明被告支付部分货款的事实                 19-20

提交人：北京宏达科技有限公司
2024年2月26日`,
        editorId: 'user_005',
        editorName: '刘小助',
        editNote: '补充完整证据清单和页码',
        createdAt: '2024-02-26T10:00:00Z',
      },
      {
        id: 'ver_002_1',
        docId: 'doc_002',
        version: 1,
        content: `证据目录

原告：北京宏达科技有限公司
被告：天津某建材公司

1. 买卖合同
2. 送货单
3. 对账单
4. 催款函`,
        editorId: 'user_005',
        editorName: '刘小助',
        editNote: '初始版本',
        createdAt: '2024-02-22T09:00:00Z',
      },
    ]);
  }

  const docVersionsKey004 = `${STORAGE_KEYS.DOCUMENTS}_versions_doc_004`;
  if (!localStorage.getItem(docVersionsKey004)) {
    saveToStorage(docVersionsKey004, [
      {
        id: 'ver_004_2',
        docId: 'doc_004',
        version: 2,
        content: `代理词

尊敬的审判长、审判员：

受原告深圳创新电子有限公司的委托，我作为其诉讼代理人参与本案诉讼。现结合庭审情况，发表如下代理意见：

一、被告生产的产品落入原告专利权保护范围
二、被告侵权行为给原告造成了重大经济损失
三、原告主张的赔偿金额合理合法

综上所述，被告的行为已构成专利侵权，请求贵院依法支持原告的全部诉讼请求。

代理人：陈律师
2024年2月15日`,
        editorId: 'user_004',
        editorName: '陈律师',
        editNote: '完善代理意见要点',
        createdAt: '2024-02-15T16:00:00Z',
      },
      {
        id: 'ver_004_1',
        docId: 'doc_004',
        version: 1,
        content: `代理词

尊敬的审判长、审判员：

受原告委托，参与本案诉讼。现发表代理意见如下：

一、被告构成专利侵权
二、请求支持原告诉讼请求

代理人：陈律师
2024年2月10日`,
        editorId: 'user_004',
        editorName: '陈律师',
        editNote: '初始版本',
        createdAt: '2024-02-10T09:00:00Z',
      },
    ]);
  }

  const docVersionsKey005 = `${STORAGE_KEYS.DOCUMENTS}_versions_doc_005`;
  if (!localStorage.getItem(docVersionsKey005)) {
    saveToStorage(docVersionsKey005, [
      {
        id: 'ver_005_4',
        docId: 'doc_005',
        version: 4,
        content: `仲裁代理意见

尊敬的仲裁员：

受申请人李娜的委托，我作为其仲裁代理人，现发表如下代理意见：

一、被申请人违法解除劳动合同事实清楚、证据确凿
1. 被申请人未对申请人进行有效的绩效考核
2. 被申请人据以解除劳动合同的规章制度未经民主程序制定
3. 被申请人解除劳动合同前未履行通知工会的法定程序

二、被申请人应支付违法解除劳动合同的赔偿金
申请人在被申请人处工作年限为5年，月平均工资为12,000元，故被申请人应支付的赔偿金为：
12,000元 × 5个月 × 2倍 = 120,000元

三、被申请人应支付申请人未休年休假工资

综上所述，被申请人解除劳动合同的行为违反法律规定，请求仲裁庭依法支持申请人的全部仲裁请求。

代理人：李建国
2023年12月5日`,
        editorId: 'user_002',
        editorName: '李建国',
        editNote: '完善赔偿金计算方式和法律依据',
        createdAt: '2023-12-05T11:00:00Z',
      },
      {
        id: 'ver_005_3',
        docId: 'doc_005',
        version: 3,
        content: `仲裁代理意见

尊敬的仲裁员：

受申请人李娜的委托，现发表如下代理意见：

一、被申请人违法解除劳动合同
1. 绩效考核不符合法定要求
2. 规章制度未经民主程序
3. 未通知工会

二、被申请人应支付赔偿金12万元

三、被申请人应支付未休年休假工资

请求仲裁庭支持申请人的仲裁请求。

代理人：李建国
2023年11月28日`,
        editorId: 'user_002',
        editorName: '李建国',
        editNote: '补充主要事实和理由',
        createdAt: '2023-11-28T15:30:00Z',
      },
      {
        id: 'ver_005_2',
        docId: 'doc_005',
        version: 2,
        content: `仲裁代理意见

尊敬的仲裁员：

受申请人李娜的委托，现发表如下代理意见：

一、被申请人违法解除劳动合同
二、被申请人应支付赔偿金

请求支持申请人的仲裁请求。

代理人：李建国
2023年11月22日`,
        editorId: 'user_002',
        editorName: '李建国',
        editNote: '草拟代理意见框架',
        createdAt: '2023-11-22T09:20:00Z',
      },
      {
        id: 'ver_005_1',
        docId: 'doc_005',
        version: 1,
        content: `仲裁代理意见

代理人：李建国`,
        editorId: 'user_002',
        editorName: '李建国',
        editNote: '初始版本',
        createdAt: '2023-11-20T09:00:00Z',
      },
    ]);
  }
}

export { getFromStorage, saveToStorage };
