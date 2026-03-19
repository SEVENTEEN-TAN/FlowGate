import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  SelectionMode,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Play, Code, Globe, GitBranch, Clock, MessageSquare, Zap, X, Trash2, HelpCircle, Database, CheckCircle2, XCircle, AlertTriangle, Bot, Send, Sparkles, Copy, Loader2, ChevronDown, FileText, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ==================== Custom Node Components ====================

function TriggerNode({ id, data, selected }: NodeProps) {
  return (
    <div className={clsx(
      "px-4 py-3 rounded-xl border-2 bg-white shadow-sm min-w-[160px]",
      selected ? "border-indigo-500 shadow-indigo-100" : "border-indigo-200"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-indigo-600" />
        <span className="text-xs font-semibold text-indigo-600 uppercase">触发器</span>
      </div>
      <div className="text-sm font-medium text-zinc-900">{data.label as string}</div>
      <div className="text-[10px] text-zinc-300 font-mono mt-1 select-all cursor-pointer" title="点击复制 ID">{id}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
}

function ScriptNode({ id, data, selected }: NodeProps) {
  const isJs = (data.scriptType as string) !== 'python';
  return (
    <div className={clsx(
      "px-4 py-3 rounded-xl border-2 bg-white shadow-sm min-w-[160px]",
      selected ? "border-amber-500 shadow-amber-100" : "border-amber-200"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1">
        <Code className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-semibold text-amber-600 uppercase">{isJs ? 'JS' : 'Python'} 脚本</span>
      </div>
      <div className="text-sm font-medium text-zinc-900">{data.label as string}</div>
      <div className="text-[10px] text-zinc-300 font-mono mt-1 select-all cursor-pointer" title="点击复制 ID">{id}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
}

function HttpNode({ id, data, selected }: NodeProps) {
  return (
    <div className={clsx(
      "px-4 py-3 rounded-xl border-2 bg-white shadow-sm min-w-[160px]",
      selected ? "border-emerald-500 shadow-emerald-100" : "border-emerald-200"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-600 uppercase">HTTP 请求</span>
      </div>
      <div className="text-sm font-medium text-zinc-900">{data.label as string}</div>
      <div className="text-[10px] text-zinc-300 font-mono mt-1 select-all cursor-pointer" title="点击复制 ID">{id}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
}

function ConditionNode({ id, data, selected }: NodeProps) {
  return (
    <div className={clsx(
      "px-4 py-3 rounded-xl border-2 bg-white shadow-sm min-w-[160px]",
      selected ? "border-purple-500 shadow-purple-100" : "border-purple-200"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1">
        <GitBranch className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-600 uppercase">条件分支</span>
      </div>
      <div className="text-sm font-medium text-zinc-900">{data.label as string}</div>
      <div className="text-[10px] text-zinc-300 font-mono mt-1 select-all cursor-pointer" title="点击复制 ID">{id}</div>
      <Handle type="source" position={Position.Bottom} id="true" className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white !left-[30%]" />
      <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-500 !w-3 !h-3 !border-2 !border-white !left-[70%]" />
    </div>
  );
}

function DelayNode({ id, data, selected }: NodeProps) {
  return (
    <div className={clsx(
      "px-4 py-3 rounded-xl border-2 bg-white shadow-sm min-w-[160px]",
      selected ? "border-sky-500 shadow-sky-100" : "border-sky-200"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-sky-600" />
        <span className="text-xs font-semibold text-sky-600 uppercase">延时</span>
      </div>
      <div className="text-sm font-medium text-zinc-900">{data.label as string}</div>
      <div className="text-[10px] text-zinc-300 font-mono mt-1 select-all cursor-pointer" title="点击复制 ID">{id}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
}

function LogNode({ id, data, selected }: NodeProps) {
  return (
    <div className={clsx(
      "px-4 py-3 rounded-xl border-2 bg-white shadow-sm min-w-[160px]",
      selected ? "border-rose-500 shadow-rose-100" : "border-rose-200"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-4 h-4 text-rose-600" />
        <span className="text-xs font-semibold text-rose-600 uppercase">日志输出</span>
      </div>
      <div className="text-sm font-medium text-zinc-900">{data.label as string}</div>
      <div className="text-[10px] text-zinc-300 font-mono mt-1 select-all cursor-pointer" title="点击复制 ID">{id}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
}

function KeyPoolNode({ id, data, selected }: NodeProps) {
  return (
    <div className={clsx('px-4 py-3 rounded-xl border-2 bg-white shadow-sm min-w-[160px]', selected ? 'border-orange-500 ring-4 ring-orange-100' : 'border-orange-200')}>
      <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1">
        <Database className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-semibold text-orange-600 uppercase">卡密库</span>
      </div>
      <div className="text-sm font-medium text-zinc-900">{data.label as string}</div>
      {data.poolName && <div className="text-xs text-zinc-400 mt-0.5">{data.poolName as string}</div>}
      <div className="text-[10px] text-zinc-300 font-mono mt-1 select-all cursor-pointer" title="点击复制 ID">{id}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
}

function SuccessEndNode({ data, selected }: NodeProps) {
  return (
    <div className={clsx('px-5 py-3 rounded-xl border-2 bg-emerald-50 shadow-sm min-w-[140px] text-center', selected ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-emerald-300')}>
      <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center justify-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <span className="text-sm font-bold text-emerald-700">成功结束</span>
      </div>
    </div>
  );
}

function FailEndNode({ data, selected }: NodeProps) {
  return (
    <div className={clsx('px-5 py-3 rounded-xl border-2 bg-red-50 shadow-sm min-w-[140px] text-center', selected ? 'border-red-500 ring-4 ring-red-100' : 'border-red-300')}>
      <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center justify-center gap-2">
        <XCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm font-bold text-red-700">失败结束</span>
      </div>
    </div>
  );
}

const nodeTypes = {
  trigger: TriggerNode,
  script: ScriptNode,
  http: HttpNode,
  condition: ConditionNode,
  delay: DelayNode,
  log: LogNode,
  key_pool: KeyPoolNode,
  end_success: SuccessEndNode,
  end_fail: FailEndNode,
};

// ==================== Node Palette ====================

const NODE_PALETTE = [
  { type: 'trigger', label: '触发器', icon: Zap, color: 'indigo', description: '流程入口' },
  { type: 'script', label: 'JS 脚本', icon: Code, color: 'amber', description: '执行 JavaScript', defaults: { scriptType: 'javascript', code: '// 在这里编写代码\nreturn { result: "hello" };' } },
  { type: 'script', label: 'Python 脚本', icon: Code, color: 'amber', description: '执行 Python', defaults: { scriptType: 'python', code: '# 在这里编写代码\nimport json\nprint(json.dumps({"result": "hello"}))' } },
  { type: 'http', label: 'HTTP 请求', icon: Globe, color: 'emerald', description: '发送 API 请求', defaults: { method: 'GET', url: '', headers: '{}', body: '', responseParseMode: 'auto', extractPath: '', outputMode: 'full' } },
  { type: 'condition', label: '条件分支', icon: GitBranch, color: 'purple', description: 'If/Else 判断', defaults: { expression: '' } },
  { type: 'delay', label: '延时等待', icon: Clock, color: 'sky', description: '暂停 N 秒', defaults: { seconds: 5 } },
  { type: 'log', label: '日志输出', icon: MessageSquare, color: 'rose', description: '输出信息给用户', defaults: { message: '' } },
  { type: 'key_pool', label: '卡密库', icon: Database, color: 'orange', description: '从卡密库取卡密', defaults: { poolId: '', poolName: '' } },
  { type: 'end_success', label: '成功结束', icon: CheckCircle2, color: 'emerald', description: '流程成功结束', defaults: {} },
  { type: 'end_fail', label: '失败结束', icon: XCircle, color: 'red', description: '流程失败结束', defaults: {} },
];

// ==================== Node Help Content ====================

const NODE_HELP: Record<string, { title: string; sections: { label: string; content: string }[] }> = {
  trigger: {
    title: '触发器节点',
    sections: [
      { label: '作用', content: '流程入口，自动接收用户前端表单填写的所有字段。' },
      { label: '输出', content: '用户表单数据，如 { username: "Alice", email: "..." }' },
    ]
  },
  script: {
    title: '脚本节点',
    sections: [
      { label: '可用变量', content: 'input — 用户表单输入\nprev — 上一节点输出\ncontext.nodeId — 指定节点输出\nconsole.log() — 输出日志' },
      { label: 'JS 示例', content: 'const name = input.username;\nconsole.log("处理中:", name);\nreturn { greeting: "Hello " + name };' },
      { label: 'Python 环境变量', content: 'USER_INPUT — 用户表单 JSON\nPREV_OUTPUT — 上一节点 JSON\nINPUT_DATA — 所有节点 JSON' },
      { label: 'Python 示例', content: 'import os, json\nuser = json.loads(os.environ["USER_INPUT"])\nprint(f"用户: {user[\"username\"]}")\nprint(json.dumps({"ok": True}))' },
      { label: '提示', content: 'JS: return 的值伜为此节点输出\nPython: 最后一行 print 的 JSON 伜为输出\nconsole.log/print 内容实时显示在用户日志' },
    ]
  },
  http: {
    title: 'HTTP 请求节点',
    sections: [
      { label: '输出', content: '{ status: 200, ok: true, data: ..., extracted: ... }' },
      { label: '解析模式', content: '自动 — 优先按 JSON 解析，否则按文本\nJSON — 强制按 JSON 解析（失败则 data=null）\n文本 — 直接输出字符串' },
      { label: '提取字段', content: '支持提取路径，例如:\n- data.token\n- result.user.id\n- items[0].id\n提取结果输出在 extracted 字段' },
      { label: '模板变量', content: 'URL/Headers/Body 中可用:\n{{input.xxx}} — 用户输入(支持多级)\n{{prev.xxx}} — 上一节点(支持多级)\n{{nodeId.output.xxx}} — 指定节点输出(支持多级)\n例如: {{prev.data.token}} / {{node_2.output.extracted}}' },
      { label: '示例', content: 'URL: https://api.example.com/user/{{input.username}}\nBody: {"email": "{{input.email}}"}\n提取路径: data.token' },
    ]
  },
  condition: {
    title: '条件分支节点',
    sections: [
      { label: '说明', content: 'True 走左侧绿色端口\nFalse 走右侧红色端口' },
      { label: '可用变量', content: 'input.xxx — 用户输入\nprev.xxx — 上一节点\ncontext.nodeId.xxx — 指定节点' },
      { label: '示例', content: 'input.age >= 18\nprev.status === 200\nprev.data.length > 0' },
    ]
  },
  delay: {
    title: '延时节点',
    sections: [
      { label: '说明', content: '暂停执行指定秒数，然后继续下一个节点。' },
    ]
  },
  log: {
    title: '日志节点',
    sections: [
      { label: '说明', content: '输出信息到用户日志面板。' },
      { label: '模板变量', content: '{{input.username}} — 用户输入\n{{prev.result}} — 上一节点\n{{nodeId.output.field}} — 指定节点' },
      { label: '示例', content: '用户 {{input.username}} 你好\n处理结果: {{prev.result}}' },
    ]
  },
  key_pool: {
    title: '卡密库节点',
    sections: [
      { label: '作用', content: '从指定的卡密库中获取一条未使用的卡密并标记为已用。' },
      { label: '输出', content: '{ key: "卡密字符串", key_id: 123, pool_id: 1, pool_name: "库名" }' },
      { label: '后续节点使用', content: 'JS 脚本: prev.key\n模板变量: {{prev.key}}' },
      { label: '注意', content: '必须先在“卡密库”管理页创建库并导入卡密。\n库中无可用卡密时节点会报错。' },
    ]
  },
  end_success: {
    title: '成功结束节点',
    sections: [
      { label: '作用', content: '标记流程执行成功。\n若口令模式为“成功后不可用”，则自动禁用口令。' },
      { label: '说明', content: '只有输入端口，无输出。\n每个流程必须至少有一个结束节点。' },
    ]
  },
  end_fail: {
    title: '失败结束节点',
    sections: [
      { label: '作用', content: '标记流程执行失败。\n口令保持可用状态，用户可重新尝试。' },
      { label: '说明', content: '只有输入端口，无输出。\n常与条件分支配合使用。' },
    ]
  },
};

// ==================== Properties Panel ====================

function PropertiesPanel({ node, onChange, onDelete }: { node: Node | null; onChange: (id: string, data: any) => void; onDelete: (id: string) => void }) {
  const [showHelp, setShowHelp] = useState(false);

  if (!node) {
    return (
      <div className="p-6 text-center text-zinc-400 text-sm">
        <p>点击节点查看/编辑属性</p>
      </div>
    );
  }

  const updateData = (key: string, value: any) => {
    onChange(node.id, { ...node.data, [key]: value });
  };

  const help = NODE_HELP[node.type || ''];

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full relative">
      {/* Help floating panel */}
      {showHelp && help && (
        <div className="absolute inset-x-0 top-0 bottom-0 bg-white z-10 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 text-sm">📖 {help.title}</h3>
            <button onClick={() => setShowHelp(false)} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {help.sections.map((sec, i) => (
              <div key={i}>
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">{sec.label}</div>
                <pre className="text-xs font-mono bg-zinc-50 rounded-lg p-3 text-zinc-700 whitespace-pre-wrap leading-relaxed border border-zinc-100">{sec.content}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 text-sm">节点属性</h3>
        <div className="flex items-center gap-1">
          {help && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-1.5 rounded-lg transition-colors ${showHelp ? 'text-indigo-600 bg-indigo-50' : 'text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title="查看帮助"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete(node.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="删除节点">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">节点名称</label>
        <input
          type="text"
          value={(node.data.label as string) || ''}
          onChange={e => updateData('label', e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Script node properties */}
      {node.type === 'script' && (
        <>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">脚本类型</label>
            <select
              value={(node.data.scriptType as string) || 'javascript'}
              onChange={e => updateData('scriptType', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">代码</label>
            <textarea
              value={(node.data.code as string) || ''}
              onChange={e => updateData('code', e.target.value)}
              rows={10}
              className="w-full px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none bg-zinc-50"
              placeholder="在此编写代码..."
            />
            <div className="text-xs text-zinc-400 mt-2 space-y-1">
              <p className="font-medium text-zinc-500">可用变量:</p>
              <p><code className="bg-zinc-100 px-1 rounded">input</code> — 用户表单输入</p>
              <p><code className="bg-zinc-100 px-1 rounded">prev</code> — 上一节点输出</p>
              <p><code className="bg-zinc-100 px-1 rounded">context.nodeId</code> — 指定节点输出</p>
              <p className="text-zinc-300 mt-1">示例: <code>input.username</code>, <code>prev.result</code></p>
            </div>
          </div>
        </>
      )}

      {/* HTTP node properties */}
      {node.type === 'http' && (
        <>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">请求方法</label>
            <select
              value={(node.data.method as string) || 'GET'}
              onChange={e => updateData('method', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">URL</label>
            <input
              type="text"
              value={(node.data.url as string) || ''}
              onChange={e => updateData('url', e.target.value)}
              placeholder="https://api.example.com/..."
              className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Headers (JSON)</label>
            <textarea
              value={(node.data.headers as string) || '{}'}
              onChange={e => updateData('headers', e.target.value)}
              rows={3}
              className="w-full px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-lg resize-none bg-zinc-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Body</label>
            <textarea
              value={(node.data.body as string) || ''}
              onChange={e => updateData('body', e.target.value)}
              rows={4}
              className="w-full px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-lg resize-none bg-zinc-50"
              placeholder="请求体内容 (支持模板变量)"
            />
          </div>
          <div className="h-px bg-zinc-100" />
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">响应解析</label>
            <select
              value={(node.data.responseParseMode as string) || 'auto'}
              onChange={e => updateData('responseParseMode', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white"
            >
              <option value="auto">自动</option>
              <option value="json">JSON</option>
              <option value="text">文本</option>
            </select>
            <p className="text-[11px] text-zinc-400 mt-1">自动：优先按 JSON 解析；失败则按文本</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">提取字段 (可选)</label>
            <input
              type="text"
              value={(node.data.extractPath as string) || ''}
              onChange={e => updateData('extractPath', e.target.value)}
              placeholder="例: data.token / items[0].id"
              className="w-full px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[11px] text-zinc-400 mt-1">提取结果会写入输出的 extracted 字段</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">输出模式</label>
            <select
              value={(node.data.outputMode as string) || 'full'}
              onChange={e => updateData('outputMode', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white"
            >
              <option value="full">全量输出</option>
              <option value="extracted">仅输出 extracted</option>
            </select>
            <p className="text-[11px] text-zinc-400 mt-1">仅输出时：节点输出为 {'{ status, ok, extracted }'}</p>
          </div>
        </>
      )}

      {/* Condition node properties */}
      {node.type === 'condition' && (
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">条件表达式</label>
          <textarea
            value={(node.data.expression as string) || ''}
            onChange={e => updateData('expression', e.target.value)}
            rows={3}
            className="w-full px-3 py-1.5 text-sm font-mono border border-zinc-200 rounded-lg resize-none bg-zinc-50"
            placeholder="例: input.age >= 18"
          />
          <div className="text-xs text-zinc-400 mt-1 space-y-0.5">
            <p>True 走左侧, False 走右侧</p>
            <p>可用: <code className="bg-zinc-100 px-1 rounded">input.xxx</code> / <code className="bg-zinc-100 px-1 rounded">prev.xxx</code></p>
            <p className="text-amber-500 font-medium mt-1">注意: 比较请用 <code className="bg-amber-100 px-1 rounded">===</code> 或 <code className="bg-amber-100 px-1 rounded">==</code>，单 <code className="bg-amber-100 px-1 rounded">=</code> 会被系统自动纠正以防赋值错误。</p>
          </div>
        </div>
      )}

      {/* Delay node properties */}
      {node.type === 'delay' && (
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">延迟秒数</label>
          <input
            type="number"
            min="1"
            value={(node.data.seconds as number) || 5}
            onChange={e => updateData('seconds', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg"
          />
        </div>
      )}

      {/* Log node properties */}
      {node.type === 'log' && (
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">日志消息</label>
          <textarea
            value={(node.data.message as string) || ''}
            onChange={e => updateData('message', e.target.value)}
            rows={4}
            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg resize-none"
            placeholder="用户你好 {{input.username}}，处理结果: {{prev.result}}"
          />
          <p className="text-xs text-zinc-400 mt-1">支持 {'{{input.xxx}}'} / {'{{prev.xxx}}'} 模板变量</p>
        </div>
      )}

    {node.type === 'key_pool' && (
      <KeyPoolSelector
        poolId={node.data.poolId as string}
        onChange={(poolId, poolName) => {
          onChange(node.id, { ...node.data, poolId, poolName });
        }}
      />
    )}
    </div>
  );
}

// Key Pool Selector component for key_pool node properties
function KeyPoolSelector({ poolId, onChange }: { poolId: string; onChange: (id: string, name: string) => void }) {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch('/api/admin/pools', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setPools(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-zinc-400">加载卡密库列表...</p>;

  const selected = pools.find(p => String(p.id) === String(poolId));

  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">选择卡密库</label>
      <select
        value={poolId ? String(poolId) : ''}
        onChange={e => {
          const p = pools.find(p => String(p.id) === e.target.value);
          onChange(e.target.value, p?.name || '');
        }}
        className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white"
      >
        <option value="">请选择卡密库...</option>
        {pools.map(p => (
          <option key={p.id} value={String(p.id)}>{p.name} ({p.unused}/{p.total})</option>
        ))}
      </select>
      {selected && (
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-emerald-600">可用: {selected.unused}</span>
          <span className="text-zinc-400">已用: {selected.used}</span>
          <span className="text-zinc-400">总计: {selected.total}</span>
        </div>
      )}
      {pools.length === 0 && (
        <p className="text-xs text-amber-500 mt-1">暂无卡密库，请先在"卡密库"管理页创建</p>
      )}
    </div>
  );
}

// ==================== AI Chat Panel (Resizable) ====================

interface AiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiMessages: { role: 'user' | 'assistant', content: string }[];
  aiInput: string;
  setAiInput: (v: string) => void;
  aiLoading: boolean;
  onSendMessage: (e?: React.FormEvent) => void;
  selectedNode: Node | null;
  onApplyCode: (code: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function AiChatPanel({
  isOpen,
  onClose,
  aiMessages,
  aiInput,
  setAiInput,
  aiLoading,
  onSendMessage,
  selectedNode,
  onApplyCode,
  messagesEndRef,
}: AiChatPanelProps) {
  const [panelWidth, setPanelWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [editingMessageIdx, setEditingMessageIdx] = useState<number | null>(null);
  const [editedCode, setEditedCode] = useState('');
  const resizerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem('aiPanelWidth');
    if (saved) setPanelWidth(parseInt(saved));
  }, [isOpen]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      const clamped = Math.max(320, Math.min(800, newWidth));
      setPanelWidth(clamped);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('aiPanelWidth', String(panelWidth));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, panelWidth]);

  const extractCodeBlocks = (content: string): string[] => {
    const matches = content.match(/```(?:javascript|js|python)?\n([\s\S]*?)```/g) || [];
    return matches.map(m => {
      const match = m.match(/```(?:javascript|js|python)?\n([\s\S]*?)```/);
      return match ? match[1].trim() : '';
    }).filter(Boolean);
  };

  const handleApplyCode = (code: string) => {
    onApplyCode(code);
    setEditingMessageIdx(null);
    setEditedCode('');
  };

  const handleStartEdit = (code: string, idx: number) => {
    setEditedCode(code);
    setEditingMessageIdx(idx);
  };

  const codeBlocks = aiMessages.flatMap((msg, i) =>
    msg.role === 'assistant' && msg.content.includes('```')
      ? extractCodeBlocks(msg.content).map((code, j) => ({ code, idx: i * 100 + j, msgIdx: i }))
      : []
  );

  const getUniqueCodeBlocks = () => {
    const seen = new Set<string>();
    return codeBlocks.filter(({ code }) => {
      if (seen.has(code)) return false;
      seen.add(code);
      return true;
    });
  };

  return (
    <>
      <div
        ref={resizerRef}
        onMouseDown={() => setIsResizing(true)}
        className={clsx(
          "fixed right-0 top-16 bottom-0 w-1 cursor-col-resize z-50 transition-colors",
          isResizing ? "bg-indigo-400" : "bg-transparent hover:bg-indigo-300"
        )}
        style={{ right: isOpen ? panelWidth - 4 : 0 }}
      />

      <div
        ref={panelRef}
        className={clsx(
          "fixed right-0 top-16 bottom-0 bg-white border-l border-zinc-200 shadow-2xl z-40 flex flex-col transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ width: panelWidth }}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 shrink-0 bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 leading-tight">FlowGate AI 助手</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-medium flex items-center gap-1.5">
                <GripVertical className="w-3 h-3" />
                可拖动调整宽度
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
          {aiMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-white border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Sparkles className="w-7 h-7 text-indigo-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 mb-2">我是您的工作流助手</h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">我可以帮您编写处理脚本、配置HTTP请求或解释现有节点结构。</p>

              <div className="mt-8 flex flex-col gap-2.5 px-2">
                <button onClick={() => setAiInput('帮我写一个JS脚本，从 input 中提取 username 并返回')} className="text-xs text-left p-3 rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm text-zinc-600 transition-all font-medium">
                  "帮我写一个简单的 JS 处理脚本"
                </button>
                <button onClick={() => setAiInput('帮我配置一个发起 POST 请求的 HTTP 节点参数')} className="text-xs text-left p-3 rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm text-zinc-600 transition-all font-medium">
                  "帮我配置一个 HTTP 节点"
                </button>
                <button onClick={() => setAiInput('解释一下我现在选中的这个节点的作用')} className="text-xs text-left p-3 rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm text-zinc-600 transition-all font-medium">
                  "解释一下我现在选中的节点"
                </button>
              </div>
            </div>
          ) : (
            <>
              {aiMessages.map((msg, i) => (
                <div key={i} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'user' ? "bg-indigo-100 border border-indigo-200" : "bg-emerald-100 border border-emerald-200"
                  )}>
                    {msg.role === 'user' ? <div className="text-sm">👤</div> : <Bot className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap overflow-hidden shadow-sm",
                    msg.role === 'user'
                      ? "bg-indigo-600 text-white rounded-tr-sm font-medium"
                      : "bg-white border border-zinc-200 text-zinc-700 rounded-tl-sm"
                  )}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div className="prose prose-sm prose-zinc max-w-none prose-pre:bg-zinc-800 prose-pre:text-zinc-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:shadow-inner prose-p:leading-relaxed prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.content.includes('```') && selectedNode?.type === 'script' && (
                      <div className="mt-3 pt-3 border-t border-zinc-100/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-xs font-medium text-indigo-600">检测到代码块</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getUniqueCodeBlocks().filter(({ msgIdx }) => msgIdx === i).map(({ code, idx }) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              {editingMessageIdx === idx ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleApplyCode(editedCode)}
                                    className="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                                  >
                                    保存
                                  </button>
                                  <button
                                    onClick={() => setEditingMessageIdx(null)}
                                    className="px-2 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
                                  >
                                    取消
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApplyCode(code)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 hover:border-indigo-200 shadow-sm"
                                  >
                                    <Code className="w-3.5 h-3.5" />
                                    应用
                                  </button>
                                  <button
                                    onClick={() => handleStartEdit(code, idx)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100 hover:border-amber-200 shadow-sm"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    编辑
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {editingMessageIdx !== null && (
                <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setEditingMessageIdx(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200" onClick={e => e.stopPropagation()}>
                    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-zinc-900 text-sm">编辑代码</h3>
                      </div>
                      <button onClick={() => setEditingMessageIdx(null)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-indigo-100 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <textarea
                        value={editedCode}
                        onChange={e => setEditedCode(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 text-sm font-mono bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                        autoFocus
                      />
                    </div>
                    <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingMessageIdx(null)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleApplyCode(editedCode)}
                        className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                      >
                        应用到选中节点
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {aiLoading && (
            <div className="flex gap-3 text-zinc-400 items-center pl-1">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex gap-1.5 bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-zinc-200 shadow-sm">
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-200 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <form onSubmit={onSendMessage} className="relative">
            {selectedNode && (
              <div className="absolute -top-8 left-1 right-1 flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-zinc-600 font-medium bg-zinc-100/80 backdrop-blur-sm rounded-t-lg border border-zinc-200 border-b-0">
                <FileText className="w-3 h-3 text-indigo-500" />
                已携带节点: <span className="text-indigo-600 max-w-[120px] truncate">{selectedNode.data.label as string}</span> 的上下文
              </div>
            )}
            <textarea
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="描述您的需求，按 Enter 发送..."
              rows={2}
              className="w-full pl-4 pr-12 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none shadow-sm"
            />
            <button
              type="submit"
              disabled={!aiInput.trim() || aiLoading}
              className="absolute right-2 bottom-2 pt-[0.1rem] pl-[0.15rem] p-1.5 w-8 h-8 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 disabled:shadow-none rounded-lg transition-all shadow-sm"
            >
              <Send className="w-4 h-4 scale-[0.9]" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ==================== Main Workflow Editor ====================

let nodeIdCounter = 0;
const getNextNodeId = () => `node_${++nodeIdCounter}`;

export default function WorkflowEditor() {
  const { appId, workflowId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [appName, setAppName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // AI Assistant states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);
  
  const handleAiQuickAction = (prompt: string) => {
    setAiInput(prompt);
  };
  
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;
    
    const token = localStorage.getItem('adminToken');
    const userMessage = { role: 'user' as const, content: aiInput.trim() };
    const newMessages = [...aiMessages, userMessage];
    setAiMessages(newMessages);
    setAiInput('');
    setAiLoading(true);

    try {
      // Build context
      let context = '';
      if (selectedNode) {
        context += `[当前选中节点]\n类型: ${selectedNode.type}\nID: ${selectedNode.id}\n名称: ${selectedNode.data.label}\n代码/配置: ${JSON.stringify(selectedNode.data, null, 2)}\n\n`;
      }
      context += `[工作流所有节点摘要]\n${nodes.map(n => `- ${n.id} (${n.type}): ${n.data.label}`).join('\n')}`;

      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: newMessages,
          node_context: context
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setAiMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setAiMessages([...newMessages, { role: 'assistant', content: `[错误] ${data.error || '请求失败'}` }]);
      }
    } catch (err: any) {
      setAiMessages([...newMessages, { role: 'assistant', content: `[错误] 网络请求异常: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const insertCodeToNode = (code: string) => {
    if (!selectedNode || selectedNode.type !== 'script') return;
    onNodeDataChange(selectedNode.id, { ...selectedNode.data, code });
  };

  // Load workflow data
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    // Load app name
    fetch(`/api/admin/apps`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(apps => {
        const app = apps.find((a: any) => String(a.id) === String(appId));
        if (app) setAppName(app.name);
      });

    // Load existing workflow if editing
    if (workflowId && workflowId !== 'new') {
      fetch(`/api/admin/apps/${appId}/workflows`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(workflows => {
          const wf = workflows.find((w: any) => String(w.id) === String(workflowId));
          if (wf) {
            setWorkflowName(wf.name);
            const parsedNodes = JSON.parse(wf.nodes || '[]');
            const parsedEdges = JSON.parse(wf.edges || '[]');
            setNodes(parsedNodes);
            setEdges(parsedEdges);
            // Set counter to avoid id conflicts
            nodeIdCounter = parsedNodes.reduce((max: number, n: Node) => {
              const num = parseInt(n.id.replace('node_', ''));
              return isNaN(num) ? max : Math.max(max, num);
            }, 0);
          }
        });
    } else {
      // New workflow - add default trigger
      setWorkflowName('新工作流');
      const triggerId = getNextNodeId();
      setNodes([{
        id: triggerId,
        type: 'trigger',
        position: { x: 300, y: 50 },
        data: { label: '开始' },
      }]);
    }
  }, [appId, workflowId]);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      animated: true,
    } as any, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onEdgeClick = useCallback((_: any, edge: any) => {
    // Just let React Flow handle selection, delete via keyboard
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeDataChange = useCallback((id: string, newData: any) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: newData } : n));
    setSelectedNode(prev => prev && prev.id === id ? { ...prev, data: newData } : prev);
  }, [setNodes]);

  const onNodeDelete = useCallback((id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // Add node from palette
  const addNode = useCallback((paletteItem: typeof NODE_PALETTE[0]) => {
    const newNode: Node = {
      id: getNextNodeId(),
      type: paletteItem.type,
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 200 },
      data: { label: paletteItem.label, ...paletteItem.defaults },
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  // Save workflow
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    const token = localStorage.getItem('adminToken');
    try {
      // Strip React Flow internal properties from nodes (measured, dragging, selected, etc.)
      const cleanNodes = nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }));
      const cleanEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || null,
        targetHandle: e.targetHandle || null,
      }));

      const nodesJson = JSON.stringify(cleanNodes);
      const edgesJson = JSON.stringify(cleanEdges);

      // --- Workflow Validation ---
      const errors: string[] = [];
      
      // Must have trigger node
      const triggerNodes = cleanNodes.filter(n => n.type === 'trigger');
      if (triggerNodes.length === 0) errors.push('\u7f3a\u5c11\u89e6\u53d1\u5668\u8282\u70b9');
      
      // Must have at least one end node
      const endNodes = cleanNodes.filter(n => n.type === 'end_success' || n.type === 'end_fail');
      if (endNodes.length === 0) errors.push('\u7f3a\u5c11\u7ed3\u675f\u8282\u70b9\uff08\u9700\u8981\u81f3\u5c11\u4e00\u4e2a\u201c\u6210\u529f\u7ed3\u675f\u201d\u6216\u201c\u5931\u8d25\u7ed3\u675f\u201d\uff09');
      
      // No orphan nodes - all nodes must be reachable from trigger
      if (triggerNodes.length > 0 && cleanNodes.length > 1) {
        const reachable = new Set<string>();
        const queue = [triggerNodes[0].id];
        while (queue.length > 0) {
          const id = queue.shift()!;
          if (reachable.has(id)) continue;
          reachable.add(id);
          cleanEdges.filter(e => e.source === id).forEach(e => queue.push(e.target));
          cleanEdges.filter(e => e.target === id).forEach(e => queue.push(e.source));
        }
        const orphans = cleanNodes.filter(n => !reachable.has(n.id));
        if (orphans.length > 0) {
          const names = orphans.map(n => n.data.label || n.id).join(', ');
          errors.push(`\u5b58\u5728\u5b64\u7acb\u8282\u70b9: ${names}`);
        }
      }
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        setSaving(false);
        return;
      }

      const effectiveId = savedId || workflowId;
      const isNew = !effectiveId || effectiveId === 'new';

      let res: Response;
      if (!isNew) {
        res = await fetch(`/api/admin/workflows/${effectiveId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: workflowName, nodes: nodesJson, edges: edgesJson }),
        });
      } else {
        res = await fetch(`/api/admin/apps/${appId}/workflows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: workflowName, nodes: nodesJson, edges: edgesJson }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || '保存失败');
      }

      const data = await res.json();
      if (data.id && isNew) {
        setSavedId(String(data.id));
        window.history.replaceState(null, '', `/admin/apps/${appId}/workflow/${data.id}`);
      }
      setSaveMsg('已保存');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err: any) {
      console.error('Workflow save error:', err);
      setSaveMsg(`保存失败: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/apps')}
            className="p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-zinc-400">{appName}</div>
            <input
              type="text"
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              className="text-base font-semibold text-zinc-900 bg-transparent border-none outline-none focus:ring-0 p-0"
              placeholder="工作流名称"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-sm text-emerald-600 font-medium">{saveMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette (Left) */}
        <div className="w-52 bg-white border-r border-zinc-200 overflow-y-auto shrink-0">
          <div className="p-3 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">节点面板</h3>
          </div>
          <div className="p-2 space-y-1">
            {NODE_PALETTE.map((item, i) => (
              <button
                key={i}
                onClick={() => addNode(item)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-50 text-left transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{item.label}</div>
                  <div className="text-xs text-zinc-400">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Delete', 'Backspace']}
            selectionOnDrag
            selectionMode={SelectionMode.Partial}
            defaultEdgeOptions={{ style: { strokeWidth: 2 }, interactionWidth: 20, selectable: true }}
            className="bg-zinc-50"
          >
            <Background color="#e4e4e7" gap={20} size={1} />
            <Controls className="!bg-white !border-zinc-200 !rounded-lg !shadow-sm" />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'trigger': return '#818cf8';
                  case 'script': return '#fbbf24';
                  case 'http': return '#34d399';
                  case 'condition': return '#a78bfa';
                  case 'delay': return '#38bdf8';
                  case 'log': return '#fb7185';
                  default: return '#94a3b8';
                }
              }}
              className="!bg-white !border-zinc-200 !rounded-lg !shadow-sm"
            />
          </ReactFlow>
        </div>

        {/* Properties Panel (Right) */}
        <div className="w-72 bg-white border-l border-zinc-200 shrink-0 flex flex-col">
          <div className="p-3 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">属性配置</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel node={selectedNode} onChange={onNodeDataChange} onDelete={onNodeDelete} />
          </div>
        </div>
      </div>

      {/* Validation Error Modal */}
      {validationErrors.length > 0 && (
        <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">{'保存失败'}</h3>
                <p className="text-sm text-red-600">{'工作流存在以下问题，请修复后重试'}</p>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {validationErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">{'⚠️'}</span>
                  <span className="text-sm text-amber-900 font-medium">{err}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setValidationErrors([])}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                {'知道了'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Chat Panel */}
      <AiChatPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        aiMessages={aiMessages}
        aiInput={aiInput}
        setAiInput={setAiInput}
        aiLoading={aiLoading}
        onSendMessage={handleSendAiMessage}
        selectedNode={selectedNode}
        onApplyCode={insertCodeToNode}
        messagesEndRef={messagesEndRef}
      />

      {/* Floating Toggle Button */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed right-6 bottom-6 flex items-center gap-2.5 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all z-30 group border border-indigo-500/20"
        >
          <Sparkles className="w-5 h-5 group-hover:animate-pulse text-indigo-100" />
          <span className="font-bold text-sm tracking-wide">AI 助手</span>
        </button>
      )}
    </div>
  );
}
