import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { KeyRound, Settings, LogOut, Plus, Trash2, Copy, CheckCircle2, Search, X, FileText, Download, Bell, Menu, AppWindow, Edit3, Play, Palette, BookOpen, Database, ChevronLeft, LayoutDashboard, TrendingUp, AlertCircle, Activity, Layers, Clock, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="h-screen bg-zinc-50 flex overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-30 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          FlowGate 控制台
        </h1>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-zinc-900/40 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-indigo-600" />
            FlowGate 控制台
          </h1>
          <button 
            className="md:hidden p-1 text-zinc-400 hover:text-zinc-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/admin/overview"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              location.pathname === '/admin/overview' ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            数据看板
          </Link>
          <Link
            to="/admin"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              location.pathname === '/admin' ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <KeyRound className="w-5 h-5" />
            口令管理
          </Link>
          <Link
            to="/admin/apps"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              location.pathname === '/admin/apps' ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <AppWindow className="w-5 h-5" />
            应用管理
          </Link>
          <Link
            to="/admin/pools"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              location.pathname === '/admin/pools' || location.pathname.startsWith('/admin/pools/') ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Database className="w-5 h-5" />
            卡密库
          </Link>
          <Link
            to="/admin/announcement"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              location.pathname === '/admin/announcement' ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Bell className="w-5 h-5" />
            公告管理
          </Link>
          <Link
            to="/admin/settings"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              location.pathname === '/admin/settings' ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Settings className="w-5 h-5" />
            系统设置
          </Link>
          <Link
            to="/admin/docs"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              location.pathname === '/admin/docs' ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <BookOpen className="w-5 h-5" />
            开发文档
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
        <Routes>
          <Route path="/overview" element={<DashboardOverview />} />
          <Route path="/" element={<ManageKeys />} />
          <Route path="/apps" element={<ManageApps />} />
          <Route path="/pools" element={<ManageKeyPools />} />
          <Route path="/pools/:poolId" element={<ManageKeyPools />} />
          <Route path="/announcement" element={<AdminAnnouncement />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/docs" element={<DevDocs />} />
        </Routes>
      </div>
    </div>
  );
}

function ManageKeys() {
  const [keys, setKeys] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'batch', id?: number } | null>(null);
  
  // Generate form state
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('');
  const [remark, setRemark] = useState('');
  const [expiresAtInput, setExpiresAtInput] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    // Format to YYYY-MM-DDThh:mm for datetime-local
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<number | ''>('');
  const [apps, setApps] = useState<any[]>([]);
  const [executionMode, setExecutionMode] = useState('unlimited');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  // Result state
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const fetchApps = async () => {
    const res = await fetch('/api/admin/apps', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setApps(data);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchKeys = async () => {
    const res = await fetch(`/api/admin/keys?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setKeys(data.data);
      setTotal(data.total);
    }
  };

  useEffect(() => {
    fetchKeys();
    setSelectedIds([]); // Clear selection when page or search changes
  }, [page, limit, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ count, prefix, remark, expires_at: new Date(expiresAtInput).toISOString(), app_id: appId, execution_mode: executionMode, valid_from: validFrom || null, valid_until: validUntil || null })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKeys(data.keys);
        setIsGenerateModalOpen(false);
        setIsResultModalOpen(true);
        setPrefix('');
        setRemark('');
        setCount(10);
        setAppId('');
        setExecutionMode('unlimited');
        setValidFrom('');
        setValidUntil('');
        const d = new Date();
        d.setDate(d.getDate() + 1);
        setExpiresAtInput(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        setPage(1);
        await fetchKeys();
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'single' && deleteTarget.id) {
      await fetch(`/api/admin/keys/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
    } else if (deleteTarget.type === 'batch') {
      await fetch('/api/admin/keys/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
    }
    
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    await fetchKeys();
  };

  const handleDelete = (id: number) => {
    setDeleteTarget({ type: 'single', id });
    setIsDeleteModalOpen(true);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget({ type: 'batch' });
    setIsDeleteModalOpen(true);
  };

  const handleBatchExport = () => {
    if (selectedIds.length === 0) return;
    const selectedKeyStrings = keys.filter(k => selectedIds.includes(k.id)).map(k => k.key_string);
    const blob = new Blob([selectedKeyStrings.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keys_export_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === keys.length && keys.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(keys.map(k => k.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllKeys = () => {
    navigator.clipboard.writeText(generatedKeys.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <h2 className="text-2xl font-bold text-zinc-900">卡密管理</h2>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={handleBatchExport}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                批量导出 ({selectedIds.length})
              </button>
              <button
                onClick={handleBatchDelete}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                批量删除 ({selectedIds.length})
              </button>
            </>
          )}
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            生成卡密
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col min-h-0 flex-1">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="搜索卡密或备注..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-50 border-b border-zinc-200 shadow-sm">
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === keys.length && keys.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-600">卡密</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-600">绑定应用</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-600">状态</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-600">备注</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-600">使用时间</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-600">过期时间</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-600 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {keys.map(k => (
                <tr key={k.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(k.id)}
                      onChange={() => toggleSelectOne(k.id)}
                      className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-zinc-900 flex items-center gap-2">
                    {k.key_string}
                    <button
                      onClick={() => copyToClipboard(k.key_string, k.id)}
                      className="text-zinc-400 hover:text-indigo-600 transition-colors"
                      title="复制卡密"
                    >
                      {copiedId === k.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {k.app_name ? (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">{k.app_name}</span>
                    ) : (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      k.status === 'unused' ? "bg-emerald-50 text-emerald-700" : 
                      k.status === 'active' ? "bg-blue-50 text-blue-700" :
                      k.status === 'used' ? "bg-zinc-100 text-zinc-600" :
                      "bg-red-50 text-red-700"
                    )}>
                      {k.status === 'unused' ? '未使用' : k.status === 'active' ? '使用中' : k.status === 'used' ? '已使用' : '已过期'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 max-w-[150px] truncate" title={k.remark}>
                    {k.remark || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {k.used_at ? new Date(k.used_at + 'Z').toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {k.expires_at ? new Date(k.expires_at + 'Z').toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    {searchQuery ? '未找到匹配的卡密。' : '暂无卡密，请先生成。'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {(totalPages > 1 || total > 0) && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-zinc-500 w-full sm:w-auto">
              <div>
                共 <span className="font-medium text-zinc-900">{total}</span> 条记录
              </div>
              <div className="flex items-center gap-2">
                <span>每页显示</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>条</span>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none text-center"
                >
                  上一页
                </button>
                <div className="flex items-center px-4 text-sm font-medium text-zinc-700 justify-center">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none text-center"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                批量生成卡密
              </h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">绑定应用 <span className="text-red-500">*</span></label>
                <select
                  required
                  value={appId}
                  onChange={e => setAppId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="">请选择应用...</option>
                  {apps.filter(a => a.status === 'enabled').map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {apps.length === 0 && <p className="text-xs text-amber-600 mt-1">请先在“应用管理”中创建应用</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">生成数量</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={count}
                  onChange={e => setCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">卡密前缀 (可选)</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={e => setPrefix(e.target.value)}
                  placeholder="例如: VIP-"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">备注信息 (可选)</label>
                <input
                  type="text"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="例如: 代理商A批次"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{'\u6267\u884c\u6a21\u5f0f'}</label>
                <select
                  value={executionMode}
                  onChange={e => setExecutionMode(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="unlimited">{'\u4e0d\u9650 \u2014 \u53ef\u65e0\u9650\u6b21\u6267\u884c'}</option>
                  <option value="one_success">{'\u6210\u529f\u540e\u4e0d\u53ef\u7528 \u2014 \u6267\u884c\u6210\u529f\u4e00\u6b21\u5373\u7981\u7528'}</option>
                  <option value="time_period">{'\u65f6\u95f4\u6bb5\u5185\u4e0d\u9650 \u2014 \u6709\u6548\u671f\u5185\u65e0\u9650\u6b21'}</option>
                </select>
              </div>
              {executionMode === 'time_period' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">{'\u6709\u6548\u5f00\u59cb'}</label>
                    <input
                      type="datetime-local"
                      value={validFrom}
                      onChange={e => setValidFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">{'\u6709\u6548\u622a\u6b62'}</label>
                    <input
                      type="datetime-local"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{'\u8fc7\u671f\u65f6\u95f4'}</label>
                <input
                  type="datetime-local"
                  required
                  value={expiresAtInput}
                  onChange={e => setExpiresAtInput(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
                <p className="text-xs text-zinc-500 mt-1">{'\u5361\u5bc6\u5c06\u5728\u8be5\u65f6\u95f4\u70b9\u5931\u6548'}</p>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? '生成中...' : '确认生成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {isResultModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                成功生成 {generatedKeys.length} 个卡密
              </h3>
              <button onClick={() => setIsResultModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-500 mb-3">请及时复制保存以下卡密，关闭后将无法再次批量查看。</p>
              <textarea 
                readOnly
                value={generatedKeys.join('\n')}
                className="w-full h-64 p-4 font-mono text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none resize-none"
              />
              <div className="mt-6 flex gap-3">
                <button
                  onClick={copyAllKeys}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  {copiedAll ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copiedAll ? '已复制' : '一键复制全部'}
                </button>
                <button
                  onClick={() => setIsResultModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-medium transition-colors"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">确认删除</h3>
              <p className="text-sm text-zinc-500">
                {deleteTarget?.type === 'batch' 
                  ? `确定要删除选中的 ${selectedIds.length} 个卡密吗？此操作无法撤销。` 
                  : '确定要删除这个卡密吗？此操作无法撤销。'}
              </p>
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminAnnouncement() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState('always');
  const [style, setStyle] = useState('top-right');

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setEnabled(true);
    setFrequency('always');
    setStyle('top-right');
    setIsModalOpen(true);
  };

  const openEditModal = (announcement: any) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    setEnabled(announcement.enabled === 1);
    setFrequency(announcement.frequency);
    setStyle(announcement.style);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条公告吗？')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setMessage('');
    setError('');
    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : '/api/admin/announcements';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ title, content, enabled, frequency, style })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage('公告已保存');
        setIsModalOpen(false);
        fetchAnnouncements();
      } else {
        setError(data.error || '保存失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  if (loading) {
    return <div className="p-8 text-zinc-500">加载中...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">公告管理</h2>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增公告
        </button>
      </div>
      
      {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{message}</div>}
      
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="px-6 py-4 text-sm font-medium text-zinc-500 w-1/3">标题</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-500">状态</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-500">频率</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-500">样式</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-500 text-right">操作</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-zinc-100">
            {announcements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  暂无公告
                </td>
              </tr>
            ) : (
              announcements.map((ann) => (
                <tr key={ann.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-900 font-medium">{ann.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={clsx(
                      "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                      ann.enabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                    )}>
                      {ann.enabled ? '已启用' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {ann.frequency === 'always' ? '每次提示' : ann.frequency === 'daily' ? '每日一次' : '仅提示一次'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {ann.style === 'top-right' ? '右上角通知' : ann.style === 'modal' ? '居中弹窗' : '顶部横幅'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => openEditModal(ann)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium mr-4"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-zinc-900">
                {editingId ? '编辑公告' : '新增公告'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">公告标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="例如：系统维护通知"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">提示频率</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="always">每次打开提示</option>
                    <option value="daily">每日提示一次</option>
                    <option value="once">仅提示一次</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">展示样式</label>
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="top-right">右上角通知 (推荐)</option>
                    <option value="modal">居中弹窗</option>
                    <option value="top-center">顶部横幅</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div>
                  <h4 className="text-sm font-medium text-zinc-900">启用状态</h4>
                  <p className="text-xs text-zinc-500">关闭后，该公告将不会在前台展示</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">公告内容 (支持富文本)</label>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent} 
                    className="bg-white min-h-[250px]"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                保存公告
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSettings() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // AI config states
  const [aiUrl, setAiUrl] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [loadingAi, setLoadingAi] = useState(true);
  const [aiSaveMsg, setAiSaveMsg] = useState('');
  const [aiTestMsg, setAiTestMsg] = useState('');
  const [testingAi, setTestingAi] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => res.json())
      .then(data => {
        setAiUrl(data.ai_api_url || 'https://api.openai.com');
        setAiKey(data.ai_api_key || '');
        setAiModel(data.ai_model_id || 'gpt-4o-mini');
        setAiPrompt(data.ai_system_prompt || '你是 FlowGate 工作流平台的 AI 助手。你帮助用户在可视化流程编辑器中构建自动化工作流。\n\n## 系统架构\nFlowGate 是一个基于卡密验证的自动化流程执行平台。用户通过卡密登录后，执行绑定的工作流。\n\n## 可用节点类型\n1. **触发器** — 流程入口，接收用户前端表单输入，输出为 input 对象\n2. **JS 脚本** — 在 Node.js 沙箱中执行 JavaScript\n   - 可用变量: input（用户输入）, prev（上一节点输出）, context.nodeId（指定节点输出）\n   - 使用 console.log() 输出日志\n   - return 的值成为此节点的输出\n3. **Python 脚本** — 执行 Python 脚本\n   - 环境变量: USER_INPUT, PREV_OUTPUT, INPUT_DATA（JSON 格式）\n   - 最后一行 print 的 JSON 成为节点输出\n4. **HTTP 请求** — 发送 HTTP 请求（GET/POST/PUT/DELETE）\n   - 输出: { status: 200, data: {...} }\n5. **条件分支** — If/Else 判断，True 走左侧，False 走右侧\n6. **延时等待** — 暂停执行指定秒数\n7. **日志输出** — 输出消息到用户日志面板\n8. **卡密库** — 从卡密库获取一条未使用的卡密\n   - 输出: { key, key_id, pool_id, pool_name }\n9. **成功结束 / 失败结束** — 标记流程执行结果\n\n## 模板变量语法\n在 HTTP、日志、脚本节点中可使用:\n- {{input.字段名}} — 用户表单输入\n- {{prev.字段名}} — 上一节点输出\n- {{nodeId.output.字段名}} — 指定节点的输出\n\n## 你的职责\n- 帮助用户生成 JS/Python 脚本代码\n- 帮助配置 HTTP 请求（URL、Headers、Body）\n- 解释和优化已有代码\n- 建议工作流设计方案\n- 用中文回答，代码注释也用中文');
        setLoadingAi(false);
      })
      .catch(err => {
        console.error('Failed to load settings', err);
        setLoadingAi(false);
      });
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('密码修改成功');
        setOldPassword('');
        setNewPassword('');
      } else {
        setError(data.error || '密码修改失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  const handleSaveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiSaveMsg('');
    const settingsToSave: any = {
      ai_api_url: aiUrl,
      ai_model_id: aiModel,
      ai_system_prompt: aiPrompt,
    };
    if (aiKey && !aiKey.includes('****')) {
      settingsToSave.ai_api_key = aiKey;
    }
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ settings: settingsToSave })
      });
      if (res.ok) {
        setAiSaveMsg('设置保存成功');
        setTimeout(() => setAiSaveMsg(''), 3000);
      } else {
        setAiTestMsg('保存失败');
      }
    } catch (err) {
      console.error(err);
      setAiTestMsg('保存出错');
    }
  };

  const handleTestAi = async () => {
    if (!aiUrl || !aiModel) {
      setAiTestMsg('请填写API URL和模型');
      return;
    }
    if (!aiKey || aiKey.includes('****')) {
      setAiTestMsg('测试连接需要输入完整的API Key，请先重新输入');
      return;
    }
    setTestingAi(true);
    setAiTestMsg('测试中...');
    try {
      const res = await fetch('/api/admin/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          api_url: aiUrl,
          api_key: aiKey,
          model_id: aiModel
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiTestMsg('连接成功！');
      } else {
        setAiTestMsg('连接失败: ' + (data.error || '未知错误'));
      }
    } catch (err: any) {
      setAiTestMsg('连接出错: ' + err.message);
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full overflow-y-auto h-full space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-8">系统设置</h2>
      
      {/* AI Settings Section */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">AI 助手配置</h3>
        </div>
        <p className="text-sm text-zinc-500 mb-6">配置 OpenAI 兼容的 API 以在流程编辑器中启用 AI 对话辅助功能。</p>

        {loadingAi ? (
          <div className="text-sm text-zinc-500">加载中...</div>
        ) : (
          <form onSubmit={handleSaveAiSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">API URL</label>
                <input
                  type="text"
                  required
                  value={aiUrl}
                  onChange={e => setAiUrl(e.target.value)}
                  placeholder="https://api.openai.com"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">API Key</label>
                <input
                  type="password"
                  placeholder={aiKey ? '(已配置)' : 'sk-...'}
                  onChange={e => setAiKey(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-xs text-zinc-500 mt-1">若不修改请留空</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">模型 ID</label>
                <input
                  type="text"
                  required
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">AI 系统提示词 (System Prompt)</label>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 text-sm font-mono border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-zinc-50 resize-none"
              />
              <p className="text-xs text-zinc-500 mt-1">此内容将作为系统级上下文发送给 AI，请在这描述您的系统和所需协助方式。</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                保存配置
              </button>
              <button
                type="button"
                onClick={handleTestAi}
                disabled={testingAi}
                className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {testingAi ? '测试中...' : '测试连接'}
              </button>
              {aiSaveMsg && <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/>{aiSaveMsg}</span>}
              {aiTestMsg && (
                <span className={clsx("text-sm font-medium", aiTestMsg.includes('成功') ? "text-emerald-600" : "text-amber-600")}>
                  {aiTestMsg}
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">修改管理员密码</h3>
        
        {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">当前密码</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">新密码</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors mt-4"
          >
            更新密码
          </button>
        </form>
      </div>
    </div>
  );
}

function ManageApps() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<any[]>([]);
  const [appWorkflows, setAppWorkflows] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('enabled');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletePreview, setDeletePreview] = useState<{ appName: string; workflowCount: number; keyCount: number; unusedKeyCount?: number; hasUiSchema: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApps = async () => {
    try {
      const res = await fetch('/api/admin/apps', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApps(data);
        // Load workflows for each app
        const wfMap: Record<number, any[]> = {};
        await Promise.all(data.map(async (app: any) => {
          try {
            const wfRes = await fetch(`/api/admin/apps/${app.id}/workflows`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (wfRes.ok) wfMap[app.id] = await wfRes.json();
          } catch {}
        }));
        setAppWorkflows(wfMap);
      }
    } catch (err) {
      console.error('Failed to fetch apps', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setStatus('enabled');
    setIsModalOpen(true);
  };

  const openEditModal = (app: any) => {
    setEditingId(app.id);
    setName(app.name);
    setDescription(app.description || '');
    setStatus(app.status);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const url = editingId ? `/api/admin/apps/${editingId}` : '/api/admin/apps';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ name, description, status })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchApps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteModal = async (appId: number) => {
    setDeleteId(appId);
    setDeletePreview(null);
    setIsDeleteModalOpen(true);
    try {
      const res = await fetch(`/api/admin/apps/${appId}/delete-preview`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) setDeletePreview(await res.json());
    } catch {}
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/apps/${deleteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setIsDeleteModalOpen(false);
    setDeleteId(null);
    setDeletePreview(null);
    setDeleting(false);
    fetchApps();
  };

  if (loading) {
    return <div className="p-8 text-zinc-500">加载中...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">应用管理</h2>
          <p className="text-sm text-zinc-500 mt-1">创建和管理自动化应用，生成卡密时需绑定应用</p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          创建应用
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
            <AppWindow className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">暂无应用</h3>
          <p className="text-zinc-500 mb-6">创建第一个应用来开始配置自动化工作流</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建应用
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map(app => (
            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <AppWindow className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{app.name}</h3>
                    <span className={clsx(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mt-1",
                      app.status === 'enabled' ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    )}>
                      {app.status === 'enabled' ? '已启用' : '已禁用'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-zinc-500 flex-1 mb-4 line-clamp-2">{app.description || '暂无描述'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <span className="text-xs text-zinc-400">{new Date(app.created_at + 'Z').toLocaleDateString()}</span>
                <div className="flex gap-1">
                  <Link
                    to={`/admin/apps/${app.id}/design`}
                    className="p-2 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                    title="设计页面"
                  >
                    <Palette className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      const wfs = appWorkflows[app.id] || [];
                      if (wfs.length > 0) {
                        navigate(`/admin/apps/${app.id}/workflow/${wfs[0].id}`);
                      } else {
                        navigate(`/admin/apps/${app.id}/workflow/new`);
                      }
                    }}
                    className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors relative"
                    title="编排工作流"
                  >
                    <Play className="w-4 h-4" />
                    {(appWorkflows[app.id]?.length || 0) > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center whitespace-nowrap">
                        已配置
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(app)}
                    className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(app.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900">
                {editingId ? '编辑应用' : '创建应用'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">应用名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例如：自动注册器"
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">应用描述</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="简要描述这个应用的功能..."
                  rows={3}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div>
                  <h4 className="text-sm font-medium text-zinc-900">启用状态</h4>
                  <p className="text-xs text-zinc-500">禁用后用户无法通过卡密访问此应用</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={status === 'enabled'}
                    onChange={(e) => setStatus(e.target.checked ? 'enabled' : 'disabled')}
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {editingId ? '保存修改' : '创建应用'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2 text-center">确认删除应用</h3>
              {deletePreview ? (
                <div className="space-y-3 mt-4">
                  <p className="text-sm text-zinc-600 text-center">您即将删除应用 <strong className="text-zinc-900">{deletePreview.appName}</strong>，以下内容将被清除：</p>
                  
                  {(deletePreview.unusedKeyCount ?? 0) > 0 && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
                      ⚠️ 仍有 {deletePreview.unusedKeyCount} 个卡密未使用，且参与 {deletePreview.appName} 应用流程中，删除本应用将同步删除这些卡密！
                    </div>
                  )}

                  <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                    {deletePreview.workflowCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        <span className="text-zinc-700">删除 <strong>{deletePreview.workflowCount}</strong> 个工作流及其执行记录</span>
                      </div>
                    )}
                    {deletePreview.hasUiSchema && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        <span className="text-zinc-700">删除页面设计 (UI Schema)</span>
                      </div>
                    )}
                    {deletePreview.keyCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        <span className="text-zinc-700">级联删除 <strong>{deletePreview.keyCount}</strong> 个绑定的卡密及执行记录</span>
                      </div>
                    )}
                    {deletePreview.workflowCount === 0 && !deletePreview.hasUiSchema && deletePreview.keyCount === 0 && (
                      <p className="text-sm text-zinc-400">该应用无关联数据</p>
                    )}
                  </div>
                  <p className="text-xs text-red-500 text-center mt-2">❗ 此操作无法撤销</p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center">加载中...</p>
              )}
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setDeleteId(null); setDeletePreview(null); }}
                className="flex-1 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={!deletePreview || deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Manage Key Pools ====================

function ManageKeyPools() {
  const navigate = useNavigate();
  const location = useLocation();
  const poolIdFromUrl = location.pathname.match(/\/pools\/(\d+)/)?.[1];
  
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  // Detail view
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [poolKeys, setPoolKeys] = useState<any[]>([]);
  const [poolKeysTotal, setPoolKeysTotal] = useState(0);
  const [poolKeysPage, setPoolKeysPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const token = localStorage.getItem('adminToken');
  const hdr = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchPools = async () => {
    const res = await fetch('/api/admin/pools', { headers: hdr });
    if (res.ok) setPools(await res.json());
    setLoading(false);
  };

  const fetchPoolKeys = async (pid: string, page = 1, status = '', search = '') => {
    let url = `/api/admin/pools/${pid}/keys?page=${page}&limit=15`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url, { headers: hdr });
    if (res.ok) {
      const data = await res.json();
      setPoolKeys(data.data);
      setPoolKeysTotal(data.total);
    }
  };

  useEffect(() => { fetchPools(); }, []);

  useEffect(() => {
    if (poolIdFromUrl && pools.length > 0) {
      const p = pools.find((p: any) => String(p.id) === poolIdFromUrl);
      if (p) {
        setSelectedPool(p);
        fetchPoolKeys(poolIdFromUrl, 1, statusFilter, searchInput);
      }
    } else {
      setSelectedPool(null);
    }
  }, [poolIdFromUrl, pools]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await fetch('/api/admin/pools', { method: 'POST', headers: hdr, body: JSON.stringify({ name: newName, description: newDesc }) });
    setIsCreateOpen(false); setNewName(''); setNewDesc('');
    fetchPools();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('\u786e\u8ba4\u5220\u9664\u8be5\u5361\u5bc6\u5e93\uff1f\u5e93\u4e2d\u6240\u6709\u5361\u5bc6\u5c06\u88ab\u6c38\u4e45\u5220\u9664\u3002')) return;
    await fetch(`/api/admin/pools/${id}`, { method: 'DELETE', headers: hdr });
    if (selectedPool?.id === id) navigate('/admin/pools');
    fetchPools();
  };

  const handleImport = async () => {
    if (!importText.trim() || !selectedPool) return;
    const res = await fetch(`/api/admin/pools/${selectedPool.id}/keys`, {
      method: 'POST', headers: hdr, body: JSON.stringify({ keys: importText })
    });
    const data = await res.json();
    setImportMsg(`\u6210\u529f\u5bfc\u5165 ${data.added} \u6761 (\u603b\u8ba1 ${data.total} \u884c)`);
    setImportText('');
    fetchPools();
    fetchPoolKeys(String(selectedPool.id), poolKeysPage, statusFilter, searchInput);
    setTimeout(() => setImportMsg(''), 3000);
  };

  const deleteKey = async (keyId: number) => {
    await fetch(`/api/admin/pool-keys/${keyId}`, { method: 'DELETE', headers: hdr });
    fetchPools();
    if (selectedPool) fetchPoolKeys(String(selectedPool.id), poolKeysPage, statusFilter, searchInput);
  };

  if (loading) return <div className="p-8 text-zinc-500">{'\u52a0\u8f7d\u4e2d...'}</div>;

  // Detail View
  if (selectedPool) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto h-full">
        <button onClick={() => navigate('/admin/pools')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 mb-4">
          <ChevronLeft className="w-4 h-4" /> {'\u8fd4\u56de\u5361\u5bc6\u5e93\u5217\u8868'}
        </button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">{selectedPool.name}</h2>
            {selectedPool.description && <p className="text-sm text-zinc-500 mt-0.5">{selectedPool.description}</p>}
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">{'\u53ef\u7528'} {selectedPool.unused}</span>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg">{'\u5df2\u7528'} {selectedPool.used}</span>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg">{'\u603b'} {selectedPool.total}</span>
          </div>
        </div>

        {/* Import area */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
          <h3 className="font-semibold text-zinc-900 text-sm mb-3">{'\u6279\u91cf\u5bfc\u5165\u5361\u5bc6'}</h3>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-200 rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder={'\u6bcf\u884c\u4e00\u4e2a\u5361\u5bc6\uff0c\u652f\u6301\u6279\u91cf\u7c98\u8d34...'}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-emerald-600">{importMsg}</span>
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {'\u5bfc\u5165'}
            </button>
          </div>
        </div>

        {/* Filter + key list */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-3 border-b border-zinc-100 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-zinc-900 text-sm flex-shrink-0">{'卡密列表'}</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setPoolKeysPage(1); fetchPoolKeys(String(selectedPool.id), 1, statusFilter, searchInput); } }}
                  placeholder={'搜索卡密/口令...'}
                  className="pl-8 pr-3 py-1 text-xs border border-zinc-200 rounded-lg w-40 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex gap-1">
                {[{v: '', l: '全部'}, {v: 'unused', l: '未用'}, {v: 'used', l: '已用'}].map(s => (
                  <button
                    key={s.v}
                    onClick={() => { setStatusFilter(s.v); setPoolKeysPage(1); fetchPoolKeys(String(selectedPool.id), 1, s.v, searchInput); }}
                    className={clsx('px-3 py-1 rounded-lg text-xs font-medium transition-colors', statusFilter === s.v ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:bg-zinc-100')}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="divide-y divide-zinc-50">
            {poolKeys.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-sm">{'\u6682\u65e0\u5361\u5bc6'}</div>
            ) : (
              poolKeys.map(k => (
                <div key={k.id} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <span className={clsx('w-2 h-2 rounded-full', k.status === 'unused' ? 'bg-emerald-400' : 'bg-zinc-300')} />
                    <code className="text-sm font-mono text-zinc-800">{k.key_value}</code>
                  </div>
                  <div className="flex items-center gap-3">
                    {k.used_by_key_string && <span className="text-xs px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded font-mono">{k.used_by_key_string}</span>}
                    {k.used_at && <span className="text-xs text-zinc-400">{'使用: '}{new Date(k.used_at + 'Z').toLocaleString()}</span>}
                    <span className="text-xs text-zinc-400">{'入库: '}{new Date(k.created_at + 'Z').toLocaleString()}</span>
                    <button onClick={() => deleteKey(k.id)} className="p-1 text-zinc-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
          {poolKeysTotal > 15 && (
            <div className="px-6 py-3 border-t border-zinc-100 flex items-center justify-between text-sm">
              <span className="text-zinc-400">{'\u5171'} {poolKeysTotal} {'\u6761'}</span>
              <div className="flex gap-1">
                <button disabled={poolKeysPage <= 1} onClick={() => { const p = poolKeysPage - 1; setPoolKeysPage(p); fetchPoolKeys(String(selectedPool.id), p, statusFilter, searchInput); }} className="px-3 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50">{'上一页'}</button>
                <button onClick={() => { const p = poolKeysPage + 1; setPoolKeysPage(p); fetchPoolKeys(String(selectedPool.id), p, statusFilter, searchInput); }} className="px-3 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-50">{'下一页'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pool list
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">{'\u5361\u5bc6\u5e93\u7ba1\u7406'}</h2>
          <p className="text-sm text-zinc-500 mt-1">{'\u7ba1\u7406\u7b2c\u4e09\u65b9 API \u5361\u5bc6\uff0c\u5de5\u4f5c\u6d41\u4e2d\u53ef\u901a\u8fc7\u300c\u5361\u5bc6\u5e93\u300d\u8282\u70b9\u81ea\u52a8\u83b7\u53d6'}</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> {'\u521b\u5efa\u5361\u5bc6\u5e93'}
        </button>
      </div>

      {pools.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 mb-4">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">{'\u6682\u65e0\u5361\u5bc6\u5e93'}</h3>
          <p className="text-zinc-500 mb-6">{'\u521b\u5efa\u5361\u5bc6\u5e93\u6765\u5b58\u50a8\u7b2c\u4e09\u65b9 API \u5361\u5bc6'}</p>
          <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> {'\u521b\u5efa\u5361\u5bc6\u5e93'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map(pool => (
            <div key={pool.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/admin/pools/${pool.id}`)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-zinc-900">{pool.name}</h3>
              </div>
              {pool.description && <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{pool.description}</p>}
              <div className="flex gap-3 text-xs mb-3">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium">{'\u53ef\u7528'} {pool.unused}</span>
                <span className="px-2 py-1 bg-zinc-100 text-zinc-500 rounded-md">{'\u5df2\u7528'} {pool.used}</span>
                <span className="px-2 py-1 bg-zinc-100 text-zinc-500 rounded-md">{'\u603b'} {pool.total}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <span className="text-xs text-zinc-400">{new Date(pool.created_at + 'Z').toLocaleDateString()}</span>
                <button onClick={e => { e.stopPropagation(); handleDelete(pool.id); }} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100"><h3 className="text-lg font-semibold text-zinc-900">{'\u521b\u5efa\u5361\u5bc6\u5e93'}</h3></div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{'\u5e93\u540d\u79f0'}</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Steam \u5361\u5bc6\u5e93" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{'\u63cf\u8ff0 (\u53ef\u9009)'}</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder={'\u7b80\u8981\u63cf\u8ff0...'} />
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-medium">{'\u53d6\u6d88'}</button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50">{'\u521b\u5efa'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Dev Docs ====================

function DevDocs() {
  const [activeSection, setActiveSection] = useState('quickstart');

  const sections = [
    { id: 'quickstart', label: '🚀 快速开始' },
    { id: 'nodes', label: '🔧 节点类型' },
    { id: 'params', label: '📦 参数传递' },
    { id: 'uibuilder', label: '🎨 页面设计' },
    { id: 'api', label: '📡 API 参考' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden relative">
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">开发文档</h2>
        <p className="text-sm text-zinc-500 mt-1">快速了解如何构建自动化应用</p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              activeSection === s.id ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">

        {/* Quick Start */}
        {activeSection === 'quickstart' && (
          <>
            <DocCard title="整体流程" accent="indigo">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: '1', title: '创建应用', desc: '在"应用管理"中创建应用，如：自动注册机器人' },
                  { step: '2', title: '设计页面', desc: '使用页面设计器拖拽表单组件，让用户输入信息' },
                  { step: '3', title: '编排工作流', desc: '在工作流编辑器中拖拽节点，构建自动化逻辑' },
                  { step: '4', title: '绑定卡密', desc: '在"卡密管理"中生成卡密并绑定到应用' },
                ].map(item => (
                  <div key={item.step} className="relative bg-white border border-zinc-200 rounded-xl p-4">
                    <div className="absolute -top-3 -left-2 w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">{item.step}</div>
                    <h4 className="font-semibold text-zinc-900 mt-2 mb-1">{item.title}</h4>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </DocCard>

            <DocCard title="用户使用流程" accent="emerald">
              <div className="flex items-center gap-3 flex-wrap text-sm">
                {['输入卡密登录', '→', '看到应用页面 (表单)', '→', '填写信息并点击按钮', '→', '触发工作流执行', '→', '查看实时日志'].map((text, i) => (
                  <span key={i} className={text === '→' ? 'text-zinc-300' : 'bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium'}>{text}</span>
                ))}
              </div>
            </DocCard>
          </>
        )}

        {/* Node Types */}
        {activeSection === 'nodes' && (
          <>
            <DocCard title="工作流节点总览" accent="amber">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="text-left py-2 pr-4 text-zinc-500 font-medium">节点</th>
                      <th className="text-left py-2 pr-4 text-zinc-500 font-medium">作用</th>
                      <th className="text-left py-2 pr-4 text-zinc-500 font-medium">输入</th>
                      <th className="text-left py-2 text-zinc-500 font-medium">输出</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr><td className="py-2 pr-4"><Badge color="indigo">触发器</Badge></td><td className="pr-4">流程入口</td><td className="pr-4">—</td><td>用户表单填写的所有字段</td></tr>
                    <tr><td className="py-2 pr-4"><Badge color="amber">JS 脚本</Badge></td><td className="pr-4">执行 JavaScript 代码</td><td className="pr-4">input / prev / context</td><td>return 的值</td></tr>
                    <tr><td className="py-2 pr-4"><Badge color="amber">Python 脚本</Badge></td><td className="pr-4">执行 Python 脚本</td><td className="pr-4">环境变量 USER_INPUT</td><td>stdout 最后一行 JSON</td></tr>
                    <tr><td className="py-2 pr-4"><Badge color="emerald">HTTP 请求</Badge></td><td className="pr-4">发送 API 请求</td><td className="pr-4">URL/Headers/Body 模板</td><td>{'{ status, data }'}</td></tr>
                    <tr><td className="py-2 pr-4"><Badge color="purple">条件分支</Badge></td><td className="pr-4">If/Else 判断</td><td className="pr-4">表达式</td><td>{'{ result: bool }'}</td></tr>
                    <tr><td className="py-2 pr-4"><Badge color="sky">延时</Badge></td><td className="pr-4">暂停 N 秒</td><td className="pr-4">秒数</td><td>—</td></tr>
                    <tr><td className="py-2 pr-4"><Badge color="rose">日志</Badge></td><td className="pr-4">输出信息给用户</td><td className="pr-4">消息模板</td><td>—</td></tr>
                  </tbody>
                </table>
              </div>
            </DocCard>

            <DocCard title="条件分支说明" accent="purple">
              <p className="text-sm text-zinc-600 mb-3">条件节点有两个输出端口：左侧 (True/绿色) 和 右侧 (False/红色)。</p>
              <CodeBlock lang="javascript" code={`// 条件表达式示例\ninput.age >= 18            // 直接使用 input\nprev.status === 200        // 使用上一节点输出\ncontext.node_2.score > 80  // 使用指定节点输出`} />
            </DocCard>
          </>
        )}

        {/* Parameter Passing */}
        {activeSection === 'params' && (
          <>
            <DocCard title="JS 脚本中可用的变量" accent="amber">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="text-left py-2 pr-4 text-zinc-500 font-medium">变量名</th>
                      <th className="text-left py-2 pr-4 text-zinc-500 font-medium">说明</th>
                      <th className="text-left py-2 text-zinc-500 font-medium">示例</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="py-2.5 pr-4"><code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono text-xs">input</code></td>
                      <td className="pr-4">用户在前端表单中输入的所有值</td>
                      <td><code className="text-xs font-mono text-zinc-600">input.username</code>、<code className="text-xs font-mono text-zinc-600">input.email</code></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4"><code className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono text-xs">prev</code></td>
                      <td className="pr-4">上一个节点的输出结果</td>
                      <td><code className="text-xs font-mono text-zinc-600">prev.result</code>、<code className="text-xs font-mono text-zinc-600">prev.data</code></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4"><code className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono text-xs">context</code></td>
                      <td className="pr-4">所有已执行节点的输出 (按 nodeId 索引)</td>
                      <td><code className="text-xs font-mono text-zinc-600">context.node_2.result</code></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4"><code className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-mono text-xs">console.log</code></td>
                      <td className="pr-4">输出到执行日志 (用户可见)</td>
                      <td><code className="text-xs font-mono text-zinc-600">console.log("处理中...")</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </DocCard>

            <DocCard title="JS 代码示例" accent="amber">
              <CodeBlock lang="javascript" code={`// 示例 1: 获取用户输入并处理
const username = input.username;
const email = input.email;
console.log("正在处理用户: " + username);
return { greeting: "Hello " + username, email: email };

// 示例 2: 使用上一节点的输出
const prevResult = prev.greeting;
console.log("收到上游数据: " + prevResult);
return { message: prevResult + ", 欢迎使用!" };

// 示例 3: 访问特定节点的输出
const step1Data = context.node_2;
return { combined: step1Data.greeting + " - " + input.email };`} />
            </DocCard>

            <DocCard title="模板变量 (用于日志 / HTTP / 条件等节点)" accent="emerald">
              <p className="text-sm text-zinc-500 mb-3">在非代码节点中，使用 {'{{ }}'} 模板语法引用变量：</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="text-left py-2 pr-4 text-zinc-500 font-medium">语法</th>
                      <th className="text-left py-2 pr-4 text-zinc-500 font-medium">说明</th>
                      <th className="text-left py-2 text-zinc-500 font-medium">示例</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr><td className="py-2 pr-4 font-mono text-xs">{`{{input.字段名}}`}</td><td className="pr-4">用户表单输入</td><td className="font-mono text-xs">{`{{input.username}}`}</td></tr>
                    <tr><td className="py-2 pr-4 font-mono text-xs">{`{{prev.字段名}}`}</td><td className="pr-4">上一节点输出</td><td className="font-mono text-xs">{`{{prev.result}}`}</td></tr>
                    <tr><td className="py-2 pr-4 font-mono text-xs">{`{{nodeId.output.字段名}}`}</td><td className="pr-4">指定节点输出</td><td className="font-mono text-xs">{`{{node_2.output.greeting}}`}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 bg-zinc-50 rounded-xl p-3">
                <p className="text-xs font-medium text-zinc-500 mb-1">日志节点示例:</p>
                <p className="text-sm font-mono text-zinc-700">{`用户 {{input.username}} 你好，处理结果：{{prev.result}}`}</p>
              </div>
            </DocCard>

            <DocCard title="Python 脚本参数获取" accent="sky">
              <p className="text-sm text-zinc-500 mb-3">Python 脚本通过环境变量获取数据：</p>
              <CodeBlock lang="python" code={`import os, json

# 获取用户前端输入的表单数据
user_input = json.loads(os.environ.get('USER_INPUT', '{}'))
username = user_input.get('username', '')

# 获取上一个节点的输出
prev_output = json.loads(os.environ.get('PREV_OUTPUT', '{}'))

# 获取所有节点的输出 (按 nodeId 索引)
all_context = json.loads(os.environ.get('INPUT_DATA', '{}'))

# 输出结果 (最后一行必须是 JSON)
result = {"processed": True, "user": username}
print(json.dumps(result))`} />
            </DocCard>
          </>
        )}

        {/* UI Builder */}
        {activeSection === 'uibuilder' && (
          <>
            <DocCard title="页面设计器使用指南" accent="violet">
              <div className="space-y-4 text-sm text-zinc-600">
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div><strong className="text-zinc-900">添加组件</strong> — 点击左侧面板中的组件，即可添加到页面中</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div><strong className="text-zinc-900">配置属性</strong> — 点击组件，在右侧面板设置标签、字段名、占位符等</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div><strong className="text-zinc-900">排序拖拽</strong> — 拖拽组件左侧的拖拽手柄调整顺序</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">4</div>
                  <div><strong className="text-zinc-900">绑定按钮</strong> — 按钮组件可绑定工作流，用户点击时自动触发</div>
                </div>
              </div>
            </DocCard>

            <DocCard title="可用组件" accent="violet">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '📝', name: '文本输入', desc: '单行文本' },
                  { icon: '🔢', name: '数字输入', desc: '数字字段' },
                  { icon: '📧', name: '邮箱输入', desc: '邮箱地址' },
                  { icon: '📄', name: '多行文本', desc: '文本域' },
                  { icon: '📋', name: '下拉选择', desc: '选项列表' },
                  { icon: '🔘', name: '开关', desc: '布尔值' },
                  { icon: '🔵', name: '按钮', desc: '触发工作流' },
                ].map(comp => (
                  <div key={comp.name} className="bg-zinc-50 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{comp.icon}</div>
                    <div className="text-sm font-medium text-zinc-800">{comp.name}</div>
                    <div className="text-xs text-zinc-400">{comp.desc}</div>
                  </div>
                ))}
              </div>
            </DocCard>

            <DocCard title="字段名 (name) 的重要性" accent="rose">
              <div className="bg-rose-50 rounded-xl p-4 text-sm text-rose-800">
                <p className="font-semibold mb-2">⚠️ 注意</p>
                <p>每个组件的 <code className="bg-white px-1 rounded">name</code> 属性决定了在工作流中如何访问该字段。</p>
                <p className="mt-2">例如：组件 name 设置为 <code className="bg-white px-1 rounded">username</code>，则在 JS 脚本中通过 <code className="bg-white px-1 rounded">input.username</code> 获取用户输入。</p>
              </div>
            </DocCard>
          </>
        )}

        {/* API Reference */}
        {activeSection === 'api' && (
          <DocCard title="API 接口参考" accent="zinc">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-left">
                    <th className="py-2 pr-3 text-zinc-500 font-medium">方法</th>
                    <th className="py-2 pr-3 text-zinc-500 font-medium">路径</th>
                    <th className="py-2 pr-3 text-zinc-500 font-medium">认证</th>
                    <th className="py-2 text-zinc-500 font-medium">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  <tr className="bg-zinc-50"><td colSpan={4} className="py-1.5 px-2 font-sans font-semibold text-zinc-900 text-sm">管理员接口</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="emerald">GET</Badge></td><td className="pr-3">/api/admin/apps</td><td className="pr-3">Admin</td><td className="font-sans">获取应用列表</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="indigo">POST</Badge></td><td className="pr-3">/api/admin/apps</td><td className="pr-3">Admin</td><td className="font-sans">创建应用</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="amber">PUT</Badge></td><td className="pr-3">/api/admin/apps/:id</td><td className="pr-3">Admin</td><td className="font-sans">更新应用 (含 ui_schema)</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="rose">DEL</Badge></td><td className="pr-3">/api/admin/apps/:id</td><td className="pr-3">Admin</td><td className="font-sans">删除应用</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="emerald">GET</Badge></td><td className="pr-3">/api/admin/apps/:id/workflows</td><td className="pr-3">Admin</td><td className="font-sans">获取工作流列表</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="indigo">POST</Badge></td><td className="pr-3">/api/admin/apps/:id/workflows</td><td className="pr-3">Admin</td><td className="font-sans">创建工作流</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="amber">PUT</Badge></td><td className="pr-3">/api/admin/workflows/:id</td><td className="pr-3">Admin</td><td className="font-sans">更新工作流</td></tr>
                  <tr className="bg-zinc-50"><td colSpan={4} className="py-1.5 px-2 font-sans font-semibold text-zinc-900 text-sm">客户端接口</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="indigo">POST</Badge></td><td className="pr-3">/api/client/verify</td><td className="pr-3">—</td><td className="font-sans">卡密验证，返回 token + app_id</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="emerald">GET</Badge></td><td className="pr-3">/api/client/apps/:id</td><td className="pr-3">—</td><td className="font-sans">获取应用详情 + ui_schema</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="indigo">POST</Badge></td><td className="pr-3">/api/client/workflow/:id/run</td><td className="pr-3">Client</td><td className="font-sans">触发工作流执行</td></tr>
                  <tr><td className="py-1.5 pr-3"><Badge color="emerald">GET</Badge></td><td className="pr-3">/api/client/executions/:id</td><td className="pr-3">Client</td><td className="font-sans">轮询执行状态和日志</td></tr>
                </tbody>
              </table>
            </div>
          </DocCard>
        )}
      </div>
      </div>
    </div>
  );
}

function DocCard({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden`}>
      <div className={`px-6 py-3 border-b border-zinc-100 bg-${accent}-50/30`}>
        <h3 className="font-semibold text-zinc-900 text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-${color}-50 text-${color}-700`}>
      {children}
    </span>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
        <span className="text-xs text-zinc-400 font-mono">{lang}</span>
        <button onClick={handleCopy} className="text-xs text-zinc-400 hover:text-white transition-colors">
          {copied ? '✓ 已复制' : '复制'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DashboardOverview() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today'|'yesterday'|'week'|'month'>('today');
  const [threshold, setThreshold] = useState(20);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/dashboard/metrics?period=${timeRange}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
    .then(r => r.json())
    .then(data => {
      setMetrics(data);
      if (data.inventory_threshold !== undefined) {
        setThreshold(data.inventory_threshold);
      }
      setLoading(false);
    });
  }, [timeRange]);

  const handleSaveThreshold = async () => {
    const val = parseInt(tempThreshold);
    if (isNaN(val) || val < 0) return;
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ settings: { inventory_alert_threshold: val.toString() } })
      });
      setThreshold(val);
      setIsEditingThreshold(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">数据加载中...</div>;

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden relative bg-zinc-50">
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-indigo-600" /> 
          数据看板
        </h1>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <AppWindow className="w-4 h-4" /> <span className="text-sm font-medium">应用总数</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">{metrics.stats.apps} <span className="text-sm font-normal text-zinc-400">个</span></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Layers className="w-4 h-4" /> <span className="text-sm font-medium">工作流总数</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">{metrics.stats.workflows} <span className="text-sm font-normal text-zinc-400">个</span></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <KeyRound className="w-4 h-4" /> <span className="text-sm font-medium">制卡总数</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">{metrics.stats.keys} <span className="text-sm font-normal text-zinc-400">张</span></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Activity className="w-4 h-4" /> <span className="text-sm font-medium">累计执行</span>
            </div>
            <div className="text-2xl font-bold text-zinc-900">{metrics.stats.executions} <span className="text-sm font-normal text-zinc-400">次</span></div>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-zinc-900">库存预警</h2>
            </div>
            <div>
              {isEditingThreshold ? (
                <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-lg border border-zinc-200">
                  <span className="text-xs text-zinc-500 pl-2">当库存小于: </span>
                  <input 
                    type="number" 
                    value={tempThreshold} 
                    onChange={e => setTempThreshold(e.target.value)}
                    className="w-16 px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    min="0"
                    autoFocus
                  />
                  <button onClick={handleSaveThreshold} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-medium">确认</button>
                  <button onClick={() => setIsEditingThreshold(false)} className="text-xs px-3 py-1 bg-white border border-zinc-300 text-zinc-600 rounded hover:bg-zinc-50 transition-colors font-medium">取消</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-500">当前触发阈值: 小于 <strong className="text-zinc-700">{threshold}</strong> 张</span>
                  <button 
                    onClick={() => { setTempThreshold(threshold.toString()); setIsEditingThreshold(true); }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md"
                  >
                    <Edit3 className="w-3 h-3" /> 修改阈值
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.inventory_pools.map((p: any) => (
              <div key={p.target_name} className={clsx("p-4 rounded-xl border flex justify-between items-center transition-all", p.unused_count < threshold ? "bg-red-50 border-red-200 shadow-sm" : "bg-zinc-50 border-zinc-200")}>
                <span className="font-medium text-zinc-700">{p.target_name || '未命名卡密库'}</span>
                <span className={clsx("font-bold text-lg", p.unused_count < threshold ? "text-red-600" : "text-emerald-600")}>{p.unused_count} <span className="text-xs font-normal opacity-70">张可用</span></span>
              </div>
            ))}
            {metrics.inventory_apps.map((a: any) => (
              <div key={a.target_name} className={clsx("p-4 rounded-xl border flex justify-between items-center transition-all", a.unused_count < threshold ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-zinc-50 border-zinc-200")}>
                <span className="font-medium text-zinc-700">{a.target_name || '未绑定应用'} (直发)</span>
                <span className={clsx("font-bold text-lg", a.unused_count < threshold ? "text-amber-600" : "text-emerald-600")}>{a.unused_count} <span className="text-xs font-normal opacity-70">张可用</span></span>
              </div>
            ))}
            {metrics.inventory_pools.length === 0 && metrics.inventory_apps.length === 0 && (
              <div className="text-zinc-500 text-sm py-2">暂无未使用的卡密库存</div>
            )}
          </div>
        </div>

        {/* Traffic Trends line char (HTML simulated bars) */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-zinc-900">口令执行图况</h2>
            </div>
            <div className="flex bg-zinc-100 p-1 rounded-lg">
              {(['today', 'yesterday', 'week', 'month'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setTimeRange(p)}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    timeRange === p ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  {p === 'today' ? '今天' : p === 'yesterday' ? '昨天' : p === 'week' ? '本周' : '本月'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap content-start gap-[1.5px] mt-4 pb-6 max-h-56 overflow-y-auto">
            {metrics.traffic.length === 0 ? (
               <div className="text-zinc-500 text-sm w-full text-center py-8">暂无调用数据</div>
            ) : metrics.traffic.map((t: any, idx: number) => {
              let dotColor = "bg-zinc-200"; // neutral
              let statusText = "未知";
              
              if (t.status === 'success') {
                dotColor = "bg-emerald-500";
                statusText = "执行成功";
              } else if (t.status === 'failed') {
                dotColor = "bg-red-500";
                statusText = "拦截 / 失败";
              } else if (t.status === 'running') {
                dotColor = "bg-indigo-500 animate-pulse";
                statusText = "执行中";
              }

              return (
                <div key={`${t.time}-${idx}`} className="group relative cursor-crosshair hover:z-50">
                  <div className={clsx("w-1.5 h-1.5 md:w-2 md:h-2 rounded-[1.5px] transition-transform duration-200 hover:scale-[2.5] hover:ring-1 hover:ring-offset-1 hover:-translate-y-0.5", dotColor)}></div>
                  
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 z-50 bg-zinc-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl outline outline-1 outline-white/10 transition-all duration-200 whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2 -translate-y-1 group-hover:-translate-y-2">
                    <div className="font-semibold mb-1 pb-1 border-b border-white/20">{t.time}</div>
                    <div className={clsx("font-mono", t.status === 'success' ? "text-emerald-400" : t.status === 'failed' ? "text-red-400" : "text-indigo-400")}>
                      状态: {statusText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 border-t border-zinc-100 pt-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500"></div> 执行成功</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-500"></div> 拦截/失败</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-indigo-500"></div> 执行中</div>
            <div className="ml-auto text-zinc-400">每次执行一个点 (最新数据靠后排布)</div>
          </div>
        </div>

        {/* Recent Executions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-zinc-900">最近十次请求活动</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 font-medium">执行状态</th>
                  <th className="px-6 py-3 font-medium">开始时间</th>
                  <th className="px-6 py-3 font-medium">来源应用</th>
                  <th className="px-6 py-3 font-medium">触发工作流</th>
                  <th className="px-6 py-3 font-medium">使用口令</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {metrics.recent_executions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-400">暂无活动记录</td></tr>
                ) : metrics.recent_executions.map((e: any) => (
                  <tr key={e.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-3 text-zinc-500">
                      {e.status === 'success' && <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-4 h-4"/> 成功</div>}
                      {e.status === 'failed' && <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700"><XCircle className="w-4 h-4"/> 失败</div>}
                      {e.status === 'running' && <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700"><Activity className="w-4 h-4"/> 执行中</div>}
                    </td>
                    <td className="px-6 py-3 text-zinc-600 font-mono tracking-tight">{e.started_at}</td>
                    <td className="px-6 py-3 font-medium text-zinc-900">{e.app_name || '-'}</td>
                    <td className="px-6 py-3 text-zinc-600">{e.workflow_name || '-'}</td>
                    <td className="px-6 py-3 font-mono text-zinc-500">{e.key_string || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
