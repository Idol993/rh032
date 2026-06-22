import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  ChevronRight,
  FileText,
  Save,
  Send,
  History,
  LayoutTemplate,
  Clock,
  User,
  File,
  X,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { Document as DocDocument, DocVersion } from '@/types';
import { documentService } from '@/services/documentService';
import { DOCUMENT_TEMPLATE_LIST, DOCUMENT_STATUS_MAP } from '@/constants';
import { formatDateTime, cn } from '@/utils';
import { useUserStore } from '@/store/useUserStore';

const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useUserStore();

  const [doc, setDoc] = useState<DocDocument | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editNote, setEditNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [versions, setVersions] = useState<DocVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<DocVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<DocVersion | null>(null);
  const [showCompareMode, setShowCompareMode] = useState(false);

  const [showSaveModal, setShowSaveModal] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  const isNew = id === 'new';

  const fetchDocument = async () => {
    if (isNew) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const doc = await documentService.getById(id!);
      if (doc) {
        setDoc(doc);
        setTitle(doc.title);
        setContent(doc.content || '');
      }
    } catch (error) {
      console.error('获取文书详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    if (isNew) return;
    setVersionsLoading(true);
    try {
      const vers = await documentService.getVersions(id!);
      setVersions(vers);
    } catch (error) {
      console.error('获取版本列表失败:', error);
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (showVersionPanel && !isNew) {
      fetchVersions();
    }
  }, [showVersionPanel]);

  useEffect(() => {
    if (searchParams.get('showVersions') === 'true' && !isNew) {
      setShowVersionPanel(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDocumentTypeName = (type: string) => {
    const template = DOCUMENT_TEMPLATE_LIST.find(t => t.id === type);
    return template?.name || type;
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = DOCUMENT_TEMPLATE_LIST.find(t => t.id === templateId);
    if (template) {
      if (doc) {
        setDoc({ ...doc, type: templateId });
      }
      if (isNew || !title) {
        setTitle(template.name);
      }
    }
    setShowTemplateDropdown(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('请输入文书标题');
      return;
    }
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      if (isNew) {
        const newDoc = await documentService.create({
          caseId: '',
          type: doc?.type || 'civil_complaint',
          title: title.trim(),
          content,
          editorId: currentUser.id,
          editorName: currentUser.name,
          status: 'draft',
        });
        setDoc(newDoc);
        navigate(`/documents/${newDoc.id}`, { replace: true });
      } else {
        const note = editNote.trim() || `更新内容`;
        const updatedDoc = await documentService.saveVersion(
          id!,
          content,
          currentUser.id,
          currentUser.name,
          note
        );
        if (updatedDoc) {
          setDoc(updatedDoc);
          setEditNote('');
          fetchVersions();
        }
      }
      setShowSaveModal(false);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!id || isNew) return;
    if (window.confirm('确定要提交审批吗？提交后将进入审批流程。')) {
      setSubmitting(true);
      try {
        const updatedDoc = await documentService.submitForReview(id);
        if (updatedDoc) {
          setDoc(updatedDoc);
        }
      } catch (error) {
        console.error('提交审批失败:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleViewVersion = (version: DocVersion) => {
    setViewingVersion(version);
    setShowCompareMode(false);
    setCompareVersion(null);
  };

  const handleCompareSelect = (version: DocVersion) => {
    if (compareVersion?.id === version.id) {
      setCompareVersion(null);
    } else {
      setCompareVersion(version);
    }
  };

  const startCompare = () => {
    if (viewingVersion && compareVersion) {
      setShowCompareMode(true);
    }
  };

  const closeVersionView = () => {
    setViewingVersion(null);
    setCompareVersion(null);
    setShowCompareMode(false);
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

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>文书中心</span>
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
        >
          <Home className="w-4 h-4" />
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-700">{isNew ? '新建文书' : '文书编辑'}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入文书标题"
                  className="text-xl font-semibold text-neutral-700 font-serif w-full border-none outline-none bg-transparent focus:ring-0 p-0"
                />
                <div className="flex items-center gap-3 mt-2">
                  {doc && (
                    <>
                      <span className={cn(getBadgeClass(DOCUMENT_STATUS_MAP[doc.status].color))}>
                        {DOCUMENT_STATUS_MAP[doc.status].label}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        v{doc.currentVersion}
                      </span>
                    </>
                  )}
                  {isNew && (
                    <span className="badge badge-neutral">新建</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="relative" ref={templateDropdownRef}>
                  <button
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <LayoutTemplate className="w-4 h-4" />
                    选择模板
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showTemplateDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-neutral-200 z-20 max-h-72 overflow-y-auto scrollbar-thin">
                      {DOCUMENT_TEMPLATE_LIST.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template.id)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors',
                            doc?.type === template.id && 'bg-primary-50 text-primary-600'
                          )}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存'}
                </button>
                {!isNew && doc?.status === 'draft' && (
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? '提交中...' : '提交审批'}
                  </button>
                )}
                <button
                  onClick={() => setShowVersionPanel(!showVersionPanel)}
                  className={cn(
                    'btn-secondary flex items-center gap-2',
                    showVersionPanel && 'bg-primary-50 text-primary-600 border-primary-500'
                  )}
                >
                  <History className="w-4 h-4" />
                  版本历史
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入文书内容..."
                className="w-full h-96 p-4 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm leading-relaxed font-mono text-neutral-700"
              />
            </div>

            {doc && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 text-xs text-neutral-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    当前版本: v{doc.currentVersion}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    最后编辑: {doc.editorName || '未知'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(doc.updatedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <File className="w-5 h-5 text-primary-500" />
              <h2 className="section-title mb-0">文书信息</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 mb-1">文书类型</p>
                <p className="text-sm font-medium text-neutral-700">
                  {doc ? getDocumentTypeName(doc.type) : '未选择'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">所属案件</p>
                <p className="text-sm text-neutral-600">
                  {doc?.caseName || <span className="text-neutral-400">未关联</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">创建时间</p>
                <p className="text-sm text-neutral-600">
                  {doc ? formatDateTime(doc.createdAt) : '-'}
                </p>
              </div>
              {doc && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">当前状态</p>
                  <span className={cn(getBadgeClass(DOCUMENT_STATUS_MAP[doc.status].color))}>
                    {DOCUMENT_STATUS_MAP[doc.status].label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-primary-500" />
              <h2 className="section-title mb-0">合规提示</h2>
            </div>
            <div className="space-y-2 text-xs text-neutral-500">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                <span>每次保存将自动生成新版本，便于留痕追溯</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                <span>提交审批后，文书将进入审批流程，不可直接编辑</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                <span>版本历史永久保留，支持版本对比和回滚</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVersionPanel && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-lg border-l border-neutral-200 z-30 animate-slide-in">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary-500" />
              <h3 className="font-medium text-neutral-700">版本历史</h3>
            </div>
            <button
              onClick={() => setShowVersionPanel(false)}
              className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {viewingVersion && !showCompareMode && (
            <div className="p-4 bg-primary-50 border-b border-primary-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-700">
                  正在查看 v{viewingVersion.version}
                </span>
                <button
                  onClick={closeVersionView}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  返回编辑
                </button>
              </div>
              <p className="text-xs text-primary-500">
                {viewingVersion.editorName} · {formatDateTime(viewingVersion.createdAt)}
              </p>
              {compareVersion && (
                <button
                  onClick={startCompare}
                  className="mt-2 w-full btn-primary text-xs flex items-center justify-center gap-1"
                >
                  <GitCompare className="w-3 h-3" />
                  与 v{compareVersion.version} 对比
                </button>
              )}
            </div>
          )}

          {showCompareMode && viewingVersion && compareVersion && (
            <div className="p-4 bg-warning-50 border-b border-warning-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-warning-700">
                  版本对比
                </span>
                <button
                  onClick={() => setShowCompareMode(false)}
                  className="text-xs text-warning-600 hover:text-warning-700"
                >
                  退出对比
                </button>
              </div>
              <p className="text-xs text-warning-600">
                v{compareVersion.version} → v{viewingVersion.version}
              </p>
            </div>
          )}

          <div className="overflow-y-auto scrollbar-thin" style={{ height: 'calc(100vh - 120px)' }}>
            {versionsLoading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">暂无版本记录</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={cn(
                      'p-4 cursor-pointer transition-colors',
                      viewingVersion?.id === version.id ? 'bg-primary-50' : 'hover:bg-neutral-50',
                      compareVersion?.id === version.id && 'bg-warning-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-700 font-mono">
                          v{version.version}
                        </span>
                        {version.id === versions[0]?.id && (
                          <span className="badge badge-success text-xs">最新</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!showCompareMode && viewingVersion && viewingVersion.id !== version.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompareSelect(version);
                            }}
                            className={cn(
                              'p-1 rounded text-xs transition-colors',
                              compareVersion?.id === version.id
                                ? 'bg-warning-100 text-warning-600'
                                : 'text-neutral-400 hover:text-warning-600 hover:bg-warning-50'
                            )}
                            title="选择对比版本"
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewVersion(version);
                          }}
                          className="p-1 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="查看版本"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {version.editorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(version.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {version.editNote}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-700">保存文书</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <label className="label-text">修改备注</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="请输入本次修改的内容说明..."
                className="input-field mt-1 h-24 resize-none"
              />
              <p className="text-xs text-neutral-400 mt-2">
                提示：每次保存将自动生成新版本，备注信息将记录在版本历史中
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-200">
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '确认保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingVersion && !showCompareMode && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40" onClick={closeVersionView}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div>
                <h3 className="font-medium text-neutral-700">
                  v{viewingVersion.version} - {viewingVersion.editNote}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {viewingVersion.editorName} · {formatDateTime(viewingVersion.createdAt)}
                </p>
              </div>
              <button
                onClick={closeVersionView}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed">
                {viewingVersion.content || '（无内容）'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {showCompareMode && viewingVersion && compareVersion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40" onClick={closeVersionView}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[80vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div>
                <h3 className="font-medium text-neutral-700">
                  版本对比：v{compareVersion.version} → v{viewingVersion.version}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {compareVersion.editorName} → {viewingVersion.editorName}
                </p>
              </div>
              <button
                onClick={closeVersionView}
                className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 flex flex-col border-r border-neutral-200">
                <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                  <span className="text-sm font-medium text-neutral-600">v{compareVersion.version}</span>
                  <span className="text-xs text-neutral-400 ml-2">{formatDateTime(compareVersion.createdAt)}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-neutral-50/50">
                  <pre className="text-sm text-neutral-600 whitespace-pre-wrap font-mono leading-relaxed">
                    {compareVersion.content || '（无内容）'}
                  </pre>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 bg-primary-50 border-b border-primary-100">
                  <span className="text-sm font-medium text-primary-600">v{viewingVersion.version}</span>
                  <span className="text-xs text-primary-400 ml-2">{formatDateTime(viewingVersion.createdAt)}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-primary-50/30">
                  <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {viewingVersion.content || '（无内容）'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVersionPanel && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setShowVersionPanel(false)}
        />
      )}
    </div>
  );
};

export default DocumentEditor;
