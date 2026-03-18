import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Type, Hash, Mail, AlignLeft, ToggleLeft, List, X, FileText } from 'lucide-react';
import { clsx } from 'clsx';

// ==================== Component Types ====================

interface UIComponent {
  id: string;
  type: 'text-input' | 'number-input' | 'email-input' | 'textarea' | 'select' | 'toggle' | 'button' | 'static-text';
  label: string;
  name: string;       // field name for data binding
  placeholder?: string;
  required?: boolean;
  options?: string[];  // for select
  buttonAction?: string; // workflow id to trigger
  defaultValue?: string;
}

const COMPONENTS_PALETTE = [
  { type: 'text-input', label: '文本输入', icon: Type, description: '单行文本' },
  { type: 'number-input', label: '数字输入', icon: Hash, description: '数字字段' },
  { type: 'email-input', label: '邮箱输入', icon: Mail, description: '邮箱地址' },
  { type: 'textarea', label: '多行文本', icon: AlignLeft, description: '文本域' },
  { type: 'select', label: '下拉选择', icon: List, description: '选项列表' },
  { type: 'toggle', label: '开关', icon: ToggleLeft, description: '是/否切换' },
  { type: 'static-text', label: '富文本展示', icon: FileText, description: '静态HTML内容' },
  { type: 'button', label: '按钮', icon: Plus, description: '触发动作' },
] as const;

let componentIdCounter = 0;

// ==================== Main Component ====================

export default function UIDesigner() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appName, setAppName] = useState('');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    // Load app
    fetch('/api/admin/apps', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(apps => {
        const app = apps.find((a: any) => String(a.id) === String(appId));
        if (app) {
          setAppName(app.name);
          try {
            const schema = JSON.parse(app.ui_schema || '[]');
            setComponents(schema);
            componentIdCounter = schema.reduce((max: number, c: UIComponent) => {
              const num = parseInt(c.id.replace('comp_', ''));
              return isNaN(num) ? max : Math.max(max, num);
            }, 0);
          } catch {}
        }
      });

    // Load workflows for button binding
    fetch(`/api/admin/apps/${appId}/workflows`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(wf => setWorkflows(wf));
  }, [appId]);

  const addComponent = (type: string) => {
    const id = `comp_${++componentIdCounter}`;
    const defaults: Partial<UIComponent> = {
      'text-input': { label: '文本字段', name: `field_${componentIdCounter}`, placeholder: '请输入...' },
      'number-input': { label: '数字字段', name: `field_${componentIdCounter}`, placeholder: '0' },
      'email-input': { label: '邮箱', name: `field_${componentIdCounter}`, placeholder: 'user@example.com' },
      'textarea': { label: '详细描述', name: `field_${componentIdCounter}`, placeholder: '请输入详细内容...' },
      'select': { label: '选择项', name: `field_${componentIdCounter}`, options: ['选项1', '选项2'] },
      'toggle': { label: '启用选项', name: `field_${componentIdCounter}` },
      'static-text': { label: '公告/说明', name: `static_${componentIdCounter}`, defaultValue: '<div class="p-4 bg-indigo-50 text-indigo-700 rounded-lg text-sm">\n  <strong>提示：</strong>这里支持输入 <b>HTML</b> 富文本内容。\n</div>' },
      'button': { label: '提交', name: `btn_${componentIdCounter}`, buttonAction: '' },
    }[type] || {};

    const newComp: UIComponent = { id, type: type as any, ...defaults } as UIComponent;
    setComponents(prev => [...prev, newComp]);
    setSelectedId(id);
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateComponent = (id: string, updates: Partial<UIComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    setComponents(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`/api/admin/apps/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ui_schema: JSON.stringify(components) }),
      });
      setSaveMsg('已保存');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch {
      setSaveMsg('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const selected = components.find(c => c.id === selectedId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = document.activeElement;
        const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.tagName === 'SELECT' || (active as HTMLElement)?.isContentEditable;
        if (!isInput) {
          removeComponent(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  return (
    <div className="h-screen flex flex-col bg-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/apps')} className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-zinc-400">{appName}</div>
            <div className="text-base font-semibold text-zinc-900">页面设计器</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-sm text-emerald-600 font-medium">{saveMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Components Palette */}
        <div className="w-52 bg-white border-r border-zinc-200 overflow-y-auto shrink-0">
          <div className="p-3 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">组件</h3>
          </div>
          <div className="p-2 space-y-1">
            {COMPONENTS_PALETTE.map((item, i) => (
              <button
                key={i}
                onClick={() => addComponent(item.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-700">{item.label}</div>
                  <div className="text-xs text-zinc-400">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 min-h-[400px]">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">表单预览</h2>
            {components.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-sm">
                从左侧面板点击组件添加到页面
              </div>
            ) : (
              <div className="space-y-4">
                {components.map((comp, index) => (
                  <div
                    key={comp.id}
                    className={clsx(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all relative group",
                      selectedId === comp.id ? "border-indigo-500 bg-indigo-50/30" : "border-transparent hover:border-zinc-200",
                      dragOverIndex === index && "border-indigo-300 bg-indigo-50"
                    )}
                    onClick={() => setSelectedId(comp.id)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = parseInt(e.dataTransfer.getData('text/plain'));
                      moveComponent(from, index);
                    }}
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-zinc-400">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeComponent(comp.id); }}
                      className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {renderPreviewComponent(comp)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-72 bg-white border-l border-zinc-200 shrink-0 flex flex-col">
          <div className="p-3 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">属性配置</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selected ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">标签文字</label>
                  <input type="text" value={selected.label} onChange={e => updateComponent(selected.id, { label: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                {selected.type !== 'static-text' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">字段名 (name)</label>
                    <input type="text" value={selected.name} onChange={e => updateComponent(selected.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                )}
                {selected.type !== 'button' && selected.type !== 'toggle' && selected.type !== 'static-text' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">占位文字</label>
                    <input type="text" value={selected.placeholder || ''} onChange={e => updateComponent(selected.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                )}
                {selected.type !== 'button' && selected.type !== 'static-text' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">必填</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={selected.required || false}
                        onChange={e => updateComponent(selected.id, { required: e.target.checked })} />
                      <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )}
                {selected.type === 'static-text' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">HTML 内容</label>
                    <textarea
                      value={selected.defaultValue || ''}
                      onChange={e => updateComponent(selected.id, { defaultValue: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="<p>输入 HTML...</p>"
                    />
                    <p className="text-xs text-zinc-400 mt-1">直接输入 HTML 代码</p>
                  </div>
                )}
                {selected.type === 'select' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">选项 (每行一个)</label>
                    <textarea
                      value={(selected.options || []).join('\n')}
                      onChange={e => updateComponent(selected.id, { options: e.target.value.split('\n').filter(Boolean) })}
                      rows={4}
                      className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg resize-none"
                    />
                  </div>
                )}
                {selected.type === 'button' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">触发工作流</label>
                    <select
                      value={selected.buttonAction || ''}
                      onChange={e => updateComponent(selected.id, { buttonAction: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white"
                    >
                      <option value="">无动作</option>
                      {workflows.map(wf => (
                        <option key={wf.id} value={wf.id}>{wf.name}</option>
                      ))}
                    </select>
                    {workflows.length === 0 && <p className="text-xs text-amber-500 mt-1">请先创建工作流</p>}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-zinc-400 text-sm py-6">点击组件查看属性</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Preview Renderer ====================

function renderPreviewComponent(comp: UIComponent) {
  switch (comp.type) {
    case 'text-input':
    case 'email-input':
      return (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">{comp.label} {comp.required && <span className="text-red-500">*</span>}</label>
          <input type={comp.type === 'email-input' ? 'email' : 'text'} placeholder={comp.placeholder} disabled
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm" />
        </div>
      );
    case 'number-input':
      return (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">{comp.label} {comp.required && <span className="text-red-500">*</span>}</label>
          <input type="number" placeholder={comp.placeholder} disabled
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm" />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">{comp.label} {comp.required && <span className="text-red-500">*</span>}</label>
          <textarea placeholder={comp.placeholder} disabled rows={3}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm resize-none" />
        </div>
      );
    case 'select':
      return (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">{comp.label} {comp.required && <span className="text-red-500">*</span>}</label>
          <select disabled className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-sm">
            <option>请选择...</option>
            {(comp.options || []).map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        </div>
      );
    case 'toggle':
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">{comp.label}</span>
          <div className="w-9 h-5 bg-zinc-200 rounded-full relative">
            <div className="absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4"></div>
          </div>
        </div>
      );
    case 'button':
      return (
        <button disabled className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm opacity-80">
          {comp.label}
        </button>
      );
    case 'static-text':
      return (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">{comp.label}</label>
          <div className="w-full prose prose-sm max-w-none prose-zinc overflow-hidden" 
               dangerouslySetInnerHTML={{ __html: comp.defaultValue || '' }} />
        </div>
      );
    default:
      return <div className="text-zinc-400 text-sm">Unknown component</div>;
  }
}
