export type UserRole = 'client' | 'assistant' | 'lawyer' | 'partner' | 'director';

export type CaseStatus = 
  | 'pending' 
  | 'intake' 
  | 'accepted' 
  | 'assigned' 
  | 'in_progress' 
  | 'trial' 
  | 'judgment' 
  | 'closed' 
  | 'archived';

export type CaseType = 'civil' | 'criminal' | 'administrative' | 'commercial' | 'labor' | 'other';

export type CasePhase = 'intake' | 'pre_trial' | 'trial' | 'judgment' | 'enforcement' | 'closed';

export type DocumentStatus = 'draft' | 'reviewing' | 'approved' | 'rejected';

export type DeadlineLevel = 'normal' | 'warning' | 'urgent' | 'overdue';

export type DeadlineType = 
  | 'lawsuit' 
  | 'evidence' 
  | 'defense' 
  | 'appeal' 
  | 'announcement' 
  | 'enforcement' 
  | 'other';

export type PaymentType = 'fixed' | 'proportion' | 'risk';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type PaymentStage = 'intake' | 'pre_trial' | 'trial' | 'judgment' | 'enforcement';

export type InvoiceStatus = 'none' | 'issued' | 'void';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskType = 
  | 'complaint' 
  | 'fee_dispute' 
  | 'major_risk' 
  | 'lawyer_change' 
  | 'delay' 
  | 'deadline_overdue' 
  | 'other';

export type RiskStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  licenseNo?: string;
  phone: string;
  email?: string;
  avatar?: string;
  expertise?: string[];
  caseLoad?: number;
  winRate?: number;
  status: 'active' | 'inactive';
  department?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  type: 'individual' | 'enterprise';
  idCard?: string;
  creditCode?: string;
  phone: string;
  email?: string;
  address?: string;
  industry?: string;
  contactPerson?: string;
  remark?: string;
  createdAt: string;
}

export type CloseCaseResult = 'win' | 'mediation' | 'lose' | 'withdraw' | 'other';

export interface Case {
  id: string;
  caseNo: string;
  name: string;
  type: CaseType;
  cause: string;
  court: string;
  judge?: string;
  amount: number;
  status: CaseStatus;
  phase: CasePhase;
  clientId: string;
  clientName: string;
  oppositeParty: string;
  lawyerId?: string;
  lawyerName?: string;
  partnerId?: string;
  partnerName?: string;
  assistantId?: string;
  assistantName?: string;
  evidenceSummary?: string;
  description?: string;
  conflictCheckResult?: 'pass' | 'fail' | 'pending';
  createdAt: string;
  acceptedAt?: string;
  closeAt?: string;
  closeReason?: string;
  closeResult?: CloseCaseResult;
  closeJudgmentAmount?: number;
  closeApplicantId?: string;
  closeApplicantName?: string;
  closeAppliedAt?: string;
  closeApprovalStatus?: 'pending' | 'approved' | 'rejected';
  closeApproverId?: string;
  closeApproverName?: string;
  closeApprovedAt?: string;
}

export interface DocVersion {
  id: string;
  docId: string;
  version: number;
  content: string;
  editorId: string;
  editorName: string;
  editNote: string;
  createdAt: string;
}

export interface Document {
  id: string;
  caseId: string;
  caseName?: string;
  type: string;
  title: string;
  templateId?: string;
  currentVersion: number;
  status: DocumentStatus;
  content?: string;
  versions?: DocVersion[];
  editorId?: string;
  editorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deadline {
  id: string;
  caseId: string;
  caseName: string;
  type: DeadlineType;
  name: string;
  deadline: string;
  remainingDays: number;
  level: DeadlineLevel;
  status: 'pending' | 'completed';
  notifiedLawyer: boolean;
  notifiedPartner: boolean;
  notifiedDirector: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  caseId: string;
  caseName: string;
  clientName: string;
  type: PaymentType;
  amount: number;
  paidAmount: number;
  stage: PaymentStage;
  status: PaymentStatus;
  invoiceNo?: string;
  invoiceStatus: InvoiceStatus;
  payAt?: string;
  remark?: string;
  createdAt: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  name: string;
  type: string;
  fileUrl?: string;
  description?: string;
  createdAt: string;
}

export interface RiskTicket {
  id: string;
  caseId: string;
  caseName: string;
  type: RiskType;
  level: RiskLevel;
  title: string;
  description: string;
  status: RiskStatus;
  reporterId: string;
  reporterName: string;
  handlerId?: string;
  handlerName?: string;
  result?: string;
  createdAt: string;
  closeAt?: string;
}

export interface CaseLog {
  id: string;
  caseId: string;
  action: string;
  operatorId: string;
  operatorName: string;
  detail: string;
  createdAt: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  targetId: string;
  targetName: string;
  detail: string;
  ip: string;
  createdAt: string;
}

export interface Archive {
  id: string;
  caseId: string;
  caseName?: string;
  caseType?: CaseType;
  clientName?: string;
  archiveNo: string;
  status: 'pending' | 'archived' | 'borrowed';
  location?: string;
  archiveAt?: string;
  createdAt: string;
}

export interface JudicialData {
  id: string;
  type: 'court_notice' | 'judgment' | 'service_notice' | 'case_progress';
  title: string;
  court: string;
  caseNo?: string;
  parties?: string;
  date: string;
  content: string;
  source: string;
  syncAt: string;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}
