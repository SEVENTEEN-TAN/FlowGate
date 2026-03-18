/**
 * Workflow Execution Engine
 * DAG-based scheduler with support for:
 *  - JS scripts (Node.js vm sandbox)
 *  - Python scripts (child_process)
 *  - HTTP requests
 *  - Conditional branching
 *  - Delay nodes
 *  - Log nodes
 *  - Parameter interpolation between nodes using {{nodeId.output.field}}
 */

import vm from 'node:vm';
import { spawn } from 'node:child_process';

// ==================== Types ====================

interface WorkflowNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position?: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
}

interface ExecutionContext {
  [nodeId: string]: {
    output: any;
    status: 'pending' | 'running' | 'success' | 'failed';
    error?: string;
  };
}

export interface ExecutionResult {
  status: 'success' | 'failed';
  context: ExecutionContext;
  logs: string[];
}

type LogCallback = (msg: string) => void;

// ==================== Interpolation ====================

/**
 * 支持的插值模板:
 *  - {{nodeId.output.field}} — 指定节点的输出字段
 *  - {{input.field}}         — 用户前端表单输入 (触发器节点的输出)
 *  - {{prev.field}}          — 上一个节点的输出字段
 */
function interpolate(template: string, context: ExecutionContext, extras?: { input?: any; prev?: any }): string {
  let result = template;

  // Replace {{input.field}}
  if (extras?.input) {
    result = result.replace(/\{\{input\.(\w+)\}\}/g, (match, field) => {
      const val = extras.input[field];
      if (val !== undefined) return typeof val === 'object' ? JSON.stringify(val) : String(val);
      return match;
    });
  }

  // Replace {{prev.field}}
  if (extras?.prev) {
    result = result.replace(/\{\{prev\.(\w+)\}\}/g, (match, field) => {
      const val = extras.prev[field];
      if (val !== undefined) return typeof val === 'object' ? JSON.stringify(val) : String(val);
      return match;
    });
  }

  // Replace {{nodeId.output.field}}
  result = result.replace(/\{\{(\w+)\.output\.(\w+)\}\}/g, (match, nodeId, field) => {
    const nodeCtx = context[nodeId];
    if (nodeCtx && nodeCtx.output && nodeCtx.output[field] !== undefined) {
      const val = nodeCtx.output[field];
      return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }
    return match;
  });

  return result;
}

function interpolateValue(value: any, context: ExecutionContext): any {
  if (typeof value === 'string') return interpolate(value, context);
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) return value.map(v => interpolateValue(v, context));
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = interpolateValue(v, context);
    }
    return result;
  }
  return value;
}

// ==================== Node Executors ====================

async function executeTriggerNode(node: WorkflowNode, context: ExecutionContext, userParams: Record<string, any>): Promise<any> {
  return userParams || {};
}

/**
 * 获取触发器节点的输出 (即用户前端键入的值)
 */
function findTriggerOutput(context: ExecutionContext, nodes: WorkflowNode[]): any {
  const trigger = nodes.find(n => n.type === 'trigger');
  if (trigger && context[trigger.id]) return context[trigger.id].output || {};
  return {};
}

/**
 * 获取当前节点的上一个节点的输出
 */
function findPrevOutput(nodeId: string, edges: WorkflowEdge[], context: ExecutionContext): any {
  const incomingEdge = edges.find(e => e.target === nodeId);
  if (incomingEdge && context[incomingEdge.source]) {
    return context[incomingEdge.source].output || {};
  }
  return {};
}

async function executeJsScript(
  node: WorkflowNode,
  context: ExecutionContext,
  log: LogCallback,
  extras: { input: any; prev: any },
): Promise<any> {
  const code = interpolate(node.data.code || '', context, extras);
  
  return new Promise((resolve, reject) => {
    try {
      const sandbox = {
        console: {
          log: (...args: any[]) => log(`[JS:${node.id}] ${args.join(' ')}`),
          error: (...args: any[]) => log(`[JS:${node.id}] ERROR: ${args.join(' ')}`),
        },
        // 用户前端表单输入 (触发器输出的值)
        input: extras.input,
        // 上一个节点的输出
        prev: extras.prev,
        // 所有节点的输出 (按 nodeId 索引)
        context: Object.fromEntries(
          Object.entries(context).map(([k, v]) => [k, v.output])
        ),
        JSON,
        Math,
        Date,
        parseInt,
        parseFloat,
        String,
        Number,
        Boolean,
        Array,
        Object,
      };

      const wrappedCode = `
        (function() {
          ${code}
        })()
      `;

      const script = new vm.Script(wrappedCode, { timeout: 30000 } as any);
      const vmContext = vm.createContext(sandbox);
      const result = script.runInContext(vmContext, { timeout: 30000 });
      
      resolve(result !== undefined ? result : {});
    } catch (err: any) {
      log(`[JS] 脚本执行失败: ${err.message}`);
      reject(err);
    }
  });
}

async function executePythonScript(
  node: WorkflowNode,
  context: ExecutionContext,
  log: LogCallback,
  extras: { input: any; prev: any },
): Promise<any> {
  const code = interpolate(node.data.code || '', context, extras);

  return new Promise((resolve, reject) => {
    const inputData = JSON.stringify(
      Object.fromEntries(
        Object.entries(context).map(([k, v]) => [k, v.output])
      )
    );

    const python = spawn('python', ['-c', code], {
      env: {
        ...process.env,
        INPUT_DATA: inputData,
        USER_INPUT: JSON.stringify(extras.input),
        PREV_OUTPUT: JSON.stringify(extras.prev),
      },
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout += text;
      log(`[Python:${node.id}] ${text.trim()}`);
    });

    python.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    python.on('close', (exitCode: number | null) => {
      if (exitCode !== 0) {
        log(`[Python] 脚本失败 (exit ${exitCode}): ${stderr}`);
        reject(new Error(`Python script exited with code ${exitCode}: ${stderr}`));
      } else {
        try {
          // Try to parse last line as JSON
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          resolve(JSON.parse(lastLine));
        } catch {
          resolve({ stdout: stdout.trim() });
        }
      }
    });

    python.on('error', (err: Error) => {
      log(`[Python] 无法启动 Python: ${err.message}`);
      reject(err);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      python.kill();
      reject(new Error('Python script timed out (60s)'));
    }, 60000);
  });
}

async function executeHttpRequest(
  node: WorkflowNode,
  context: ExecutionContext,
  log: LogCallback,
  extras: { input: any; prev: any },
): Promise<any> {
  const method = (node.data.method || 'GET').toUpperCase();
  const url = interpolate(node.data.url || '', context, extras);
  let headers: Record<string, string> = {};
  
  try {
    headers = JSON.parse(interpolate(node.data.headers || '{}', context, extras));
  } catch {}

  const body = method !== 'GET' ? interpolate(node.data.body || '', context, extras) : undefined;

  log(`[HTTP] ${method} ${url}`);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (body) fetchOptions.body = body;

    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    
    let responseData: any;
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = { body: text };
    }

    log(`[HTTP] 响应状态: ${response.status}`);
    return { status: response.status, data: responseData };
  } catch (err: any) {
    log(`[HTTP] 请求失败: ${err.message}`);
    throw err;
  }
}

function evaluateCondition(
  node: WorkflowNode,
  context: ExecutionContext,
  log: LogCallback,
  extras: { input: any; prev: any },
): boolean {
  let expression = interpolate(node.data.expression || 'true', context, extras);
  
  // Auto-correct single '=' to '===' to prevent assignment bugs
  const regex = /(?<![!<>=])=(?!=)/g;
  if (regex.test(expression)) {
    expression = expression.replace(regex, '===');
    log(`[条件] ⚠️ 警告: 检测到单等号 '='，已自动转换为 '==='`);
  }
  
  try {
    const sandbox = {
      input: extras.input,
      prev: extras.prev,
      context: Object.fromEntries(
        Object.entries(context).map(([k, v]) => [k, v.output])
      ),
    };
    const result = vm.runInNewContext(expression, sandbox, { timeout: 5000 });
    log(`[条件] 结果: ${result ? 'True' : 'False'}`);
    return !!result;
  } catch (err: any) {
    log(`[条件] 评估失败: ${err.message}, 默认 false`);
    return false;
  }
}

async function executeDelayNode(node: WorkflowNode, context: ExecutionContext, log: LogCallback): Promise<any> {
  const seconds = node.data.seconds || 5;
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  return {};
}

function executeLogNode(
  node: WorkflowNode,
  context: ExecutionContext,
  log: LogCallback,
  extras: { input: any; prev: any },
): any {
  const message = interpolate(node.data.message || '', context, extras);
  log(`[日志] ${message}`);
  return { message };
}

/**
 * 卡密库节点 - 从指定卡密库中获取一条未使用的卡密
 */
async function executeKeyPoolNode(
  node: WorkflowNode,
  context: ExecutionContext,
  log: LogCallback,
  userParams: Record<string, any> = {},
): Promise<any> {
  const poolId = node.data.poolId;
  if (!poolId) throw new Error('未配置卡密库 ID');

  const db = (globalThis as any).__db;
  if (!db) throw new Error('数据库连接不可用');

  const pool = db.prepare('SELECT * FROM key_pools WHERE id = ?').get(poolId) as any;
  if (!pool) throw new Error(`卡密库 #${poolId} 不存在`);

  const key = db.prepare('SELECT * FROM pool_keys WHERE pool_id = ? AND status = ? LIMIT 1').get(poolId, 'unused') as any;
  if (!key) throw new Error(`卡密库「${pool.name}」已无可用卡密`);

  // Mark as used, include the card key string that triggered it
  const keyString = userParams.__key_string || null;
  db.prepare('UPDATE pool_keys SET status = ?, used_at = CURRENT_TIMESTAMP, used_by_key_string = ? WHERE id = ?').run('used', keyString, key.id);

  log(`[卡密库] 从「${pool.name}」获取卡密: ${key.key_value.substring(0, 6)}***`);

  return {
    key: key.key_value,
    key_id: key.id,
    pool_id: poolId,
    pool_name: pool.name,
  };
}

// ==================== DAG Scheduler ====================

function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};
  
  for (const node of nodes) {
    inDegree[node.id] = 0;
    adjacency[node.id] = [];
  }

  for (const edge of edges) {
    adjacency[edge.source].push(edge.target);
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
  }

  const queue: string[] = [];
  for (const nodeId of Object.keys(inDegree)) {
    if (inDegree[nodeId] === 0) queue.push(nodeId);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return sorted;
}

export async function executeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  userParams: Record<string, any> = {},
  onLog?: LogCallback,
): Promise<ExecutionResult> {
  const context: ExecutionContext = {};
  const logs: string[] = [];
  
  const log: LogCallback = (msg) => {
    const timestamped = `[${new Date().toISOString()}] ${msg}`;
    logs.push(timestamped);
    onLog?.(timestamped);
  };

  // Init context for all nodes
  for (const node of nodes) {
    context[node.id] = { output: null, status: 'pending' };
  }

  const sortedIds = topologicalSort(nodes, edges);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Track which nodes to skip (from condition branching)
  const skipNodes = new Set<string>();

  log('=== 工作流开始执行 ===');
  log(`[参数] 用户输入: ${JSON.stringify(userParams)}`);

  for (const nodeId of sortedIds) {
    if (skipNodes.has(nodeId)) {
      context[nodeId].status = 'success';
      context[nodeId].output = {};
      log(`[跳过] 节点 ${nodeId} (条件分支跳过)`);
      continue;
    }

    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // Build extras: input = trigger output (user form), prev = previous node output
    const input = findTriggerOutput(context, nodes);
    const prev = findPrevOutput(nodeId, edges, context);
    const extras = { input, prev };

    context[nodeId].status = 'running';
    log(`--- 执行节点: ${node.data.label || node.id} (${node.type}) ---`);

    try {
      let output: any;

      switch (node.type) {
        case 'trigger':
          output = await executeTriggerNode(node, context, userParams);
          break;
        case 'script':
          if (node.data.scriptType === 'python') {
            output = await executePythonScript(node, context, log, extras);
          } else {
            output = await executeJsScript(node, context, log, extras);
          }
          break;
        case 'http':
          output = await executeHttpRequest(node, context, log, extras);
          break;
        case 'condition': {
          const result = evaluateCondition(node, context, log, extras);
          output = { result };
          
          // Skip nodes on the branch that wasn't taken
          const skipHandle = result ? 'false' : 'true';
          const edgesToSkip = edges.filter(e => e.source === node.id && e.sourceHandle === skipHandle);
          
          // BFS to find all downstream nodes to skip
          const toSkip = new Set<string>();
          const bfsQueue = edgesToSkip.map(e => e.target);
          while (bfsQueue.length > 0) {
            const id = bfsQueue.shift()!;
            if (!toSkip.has(id)) {
              toSkip.add(id);
              edges.filter(e => e.source === id).forEach(e => bfsQueue.push(e.target));
            }
          }
          // Don't skip nodes that are also reachable from the active branch
          const activeHandle = result ? 'true' : 'false';
          const activeEdges = edges.filter(e => e.source === node.id && e.sourceHandle === activeHandle);
          const reachable = new Set<string>();
          const activeBfsQueue = activeEdges.map(e => e.target);
          while (activeBfsQueue.length > 0) {
            const id = activeBfsQueue.shift()!;
            if (!reachable.has(id)) {
              reachable.add(id);
              edges.filter(e => e.source === id).forEach(e => activeBfsQueue.push(e.target));
            }
          }
          for (const id of toSkip) {
            if (!reachable.has(id)) skipNodes.add(id);
          }
          break;
        }
        case 'delay':
          output = await executeDelayNode(node, context, log);
          break;
        case 'log':
          output = executeLogNode(node, context, log, extras);
          break;
        case 'key_pool':
          output = await executeKeyPoolNode(node, context, log, userParams);
          break;
        case 'end_success':
          context[nodeId].output = { __end: 'success' };
          context[nodeId].status = 'success';
          log('✅ 工作流执行成功（成功结束节点）');
          log('=== 工作流执行完成 ===');
          return { status: 'success', context, logs };
        case 'end_fail':
          context[nodeId].output = { __end: 'fail' };
          context[nodeId].status = 'success'; // node itself executed OK
          log('❌ 工作流执行失败（失败结束节点）');
          log('=== 工作流执行失败 ===');
          return { status: 'failed', context, logs };
        default:
          output = {};
          log(`[警告] 未知节点类型: ${node.type}`);
      }

      context[nodeId].output = output;
      context[nodeId].status = 'success';
    } catch (err: any) {
      context[nodeId].status = 'failed';
      context[nodeId].error = err.message;
      log(`[错误] 节点执行失败: ${err.message}`);
      
      // Fail fast - stop execution on error
      log('=== 工作流执行失败 ===');
      return { status: 'failed', context, logs };
    }
  }

  log('=== 工作流执行完成 ===');
  return { status: 'success', context, logs };
}
