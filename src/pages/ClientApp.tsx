import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AppWindow, Clock, Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import DOMPurify from 'dompurify';

interface UIComponent {
  id: string;
  type: 'text-input' | 'number-input' | 'email-input' | 'textarea' | 'select' | 'toggle' | 'button' | 'static-text';
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  buttonAction?: string;
  defaultValue?: string;
}

interface AppInfo {
  id: number;
  name: string;
  description: string;
  ui_schema: string;
  status: string;
}

interface WorkflowInfo {
  id: number;
  name: string;
}

export default function ClientApp() {
  const navigate = useNavigate();
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [uiComponents, setUiComponents] = useState<UIComponent[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Execution state
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executing, setExecuting] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);

  const token = sessionStorage.getItem('clientToken');
  const appId = sessionStorage.getItem('clientAppId');

  useEffect(() => {
    if (!token) { navigate('/'); return; }

    const expires = sessionStorage.getItem('clientTokenExpiresAt');

    // Load app info
    if (appId) {
      Promise.all([
        fetch(`/api/client/apps/${appId}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/client/apps/${appId}/workflows`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []),
      ]).then(([app, wfs]) => {
        if (app) {
          setAppInfo(app);
          try {
            const schema = JSON.parse(app.ui_schema || '[]');
            setUiComponents(schema);
            // Init form data
            const initial: Record<string, any> = {};
            schema.forEach((c: UIComponent) => {
              if (c.type !== 'button') {
                initial[c.name] = c.type === 'toggle' ? false : '';
              }
            });
            setFormData(initial);
          } catch {}
        }
        setWorkflows(wfs || []);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Expiration timer
    if (expires) {
      setExpiresAt(expires);
      const checkExpiration = () => {
        const now = new Date();
        const exp = new Date(expires);
        if (now >= exp) {
          sessionStorage.removeItem('clientToken');
          sessionStorage.removeItem('clientTokenExpiresAt');
          sessionStorage.removeItem('clientAppId');
          alert('您的卡密已过期，请重新登录。');
          navigate('/');
        } else {
          const diff = exp.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(hours > 24 ? `${Math.floor(hours / 24)}天 ${hours % 24}小时` : hours > 0 ? `${hours}小时 ${minutes}分钟` : `${minutes}分钟`);
        }
      };
      checkExpiration();
      const interval = setInterval(checkExpiration, 60000);
      return () => clearInterval(interval);
    }
  }, [navigate, token, appId]);

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionLogs]);

  // Cleanup polling
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('clientToken');
    sessionStorage.removeItem('clientTokenExpiresAt');
    sessionStorage.removeItem('clientAppId');
    navigate('/');
  };

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerWorkflow = async (workflowId: string) => {
    if (!token) return;
    setExecuting(true);
    setExecutionLogs([]);
    setExecutionStatus('running');

    try {
      const res = await fetch(`/api/client/workflow/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ params: formData }),
      });
      const data = await res.json();
      
      if (data.error) {
        setExecutionStatus('failed');
        setExecutionLogs([`[错误] 启动失败: ${data.error}`]);
        setExecuting(false);
        return;
      }

      if (data.execution_id) {
        setExecutionId(data.execution_id);
        // Start polling
        pollRef.current = window.setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/client/executions/${data.execution_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const pollData = await pollRes.json();
            setExecutionLogs(pollData.logs || []);
            setExecutionStatus(pollData.status);
            
            if (pollData.status !== 'running') {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;
              setExecuting(false);
            }
          } catch {}
        }, 1000);
      }
    } catch (err) {
      setExecutionStatus('failed');
      setExecutionLogs(prev => [...prev, 'Failed to start workflow']);
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <AppWindow className="w-5 h-5 text-indigo-600" />
          {appInfo?.name || '应用'}
        </div>
        <div className="flex items-center gap-4">
          {timeLeft && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              {timeLeft}
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
        {/* Form Section */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
            {appInfo?.description && (
              <p className="text-sm text-zinc-500 mb-6">{appInfo.description}</p>
            )}
            {uiComponents.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <AppWindow className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>应用页面尚未配置</p>
              </div>
            ) : (
              <div className="space-y-5">
                {uiComponents.map(comp => renderFormComponent(comp, formData, updateField, triggerWorkflow, executing))}
              </div>
            )}
          </div>
        </div>

        {/* Execution Logs Panel */}
        {(executionStatus || executionLogs.length > 0) && (
          <div className="lg:w-[420px] shrink-0">
            <div className="bg-zinc-900 rounded-2xl shadow-lg border border-zinc-700 overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {executionStatus === 'running' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                  {executionStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {executionStatus === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm font-medium text-zinc-300">执行日志</span>
                </div>
                <span className={clsx(
                  "text-xs font-medium px-2 py-0.5 rounded-md",
                  executionStatus === 'running' ? "bg-indigo-500/20 text-indigo-300" :
                  executionStatus === 'success' ? "bg-emerald-500/20 text-emerald-300" :
                  "bg-red-500/20 text-red-300"
                )}>
                  {executionStatus === 'running' ? '执行中' : executionStatus === 'success' ? '完成' : '失败'}
                </span>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed">
                {executionLogs.map((log, i) => (
                  <div key={i} className={clsx(
                    "py-0.5",
                    log.includes('[错误]') || log.includes('ERROR') || log.includes('失败') ? "text-red-400" :
                    log.includes('===') ? "text-indigo-400 font-semibold" :
                    log.includes('[日志]') ? "text-emerald-400" :
                    "text-zinc-400"
                  )}>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==================== Form Component Renderer ====================

function renderFormComponent(
  comp: UIComponent,
  formData: Record<string, any>,
  onChange: (name: string, value: any) => void,
  onAction: (workflowId: string) => void,
  executing: boolean,
) {
  switch (comp.type) {
    case 'text-input':
    case 'email-input':
      return (
        <div key={comp.id}>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {comp.label} {comp.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={comp.type === 'email-input' ? 'email' : 'text'}
            placeholder={comp.placeholder}
            required={comp.required}
            value={formData[comp.name] || ''}
            onChange={e => onChange(comp.name, e.target.value)}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
      );
    case 'number-input':
      return (
        <div key={comp.id}>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {comp.label} {comp.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            placeholder={comp.placeholder}
            required={comp.required}
            value={formData[comp.name] || ''}
            onChange={e => onChange(comp.name, e.target.value)}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
      );
    case 'textarea':
      return (
        <div key={comp.id}>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {comp.label} {comp.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            placeholder={comp.placeholder}
            required={comp.required}
            value={formData[comp.name] || ''}
            onChange={e => onChange(comp.name, e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
          />
        </div>
      );
    case 'select':
      return (
        <div key={comp.id}>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {comp.label} {comp.required && <span className="text-red-500">*</span>}
          </label>
          <select
            required={comp.required}
            value={formData[comp.name] || ''}
            onChange={e => onChange(comp.name, e.target.value)}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-colors"
          >
            <option value="">请选择...</option>
            {(comp.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    case 'toggle':
      return (
        <div key={comp.id} className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-zinc-700">{comp.label}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData[comp.name] || false}
              onChange={e => onChange(comp.name, e.target.checked)}
            />
            <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      );
    case 'button':
      return (
        <button
          key={comp.id}
          disabled={executing || !comp.buttonAction}
          onClick={() => comp.buttonAction && onAction(comp.buttonAction)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {executing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> 执行中...</>
          ) : (
            <><Play className="w-4 h-4" /> {comp.label}</>
          )}
        </button>
      );
    case 'static-text':
      return (
        <div key={comp.id} className="py-2">
          {comp.label && <h3 className="text-lg font-bold text-zinc-900 mb-3">{comp.label}</h3>}
          <div 
            className="w-full prose prose-sm max-w-none prose-zinc overflow-hidden" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comp.defaultValue || '', { ADD_ATTR: ['target'] }) }} 
          />
        </div>
      );
    default:
      return null;
  }
}
