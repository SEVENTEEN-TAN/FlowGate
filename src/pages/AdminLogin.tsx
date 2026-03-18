import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-zinc-100 text-zinc-600 rounded-xl">
            <Lock className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center text-zinc-900 mb-2">管理员登录</h2>
        <p className="text-center text-zinc-500 mb-8">登录以管理您的系统。</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">账号</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors mt-6"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
