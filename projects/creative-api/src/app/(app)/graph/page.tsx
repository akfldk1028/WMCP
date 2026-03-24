'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { Graph3DData, Graph3DNode } from '@/types/graph';

const ForceGraph3D = dynamic(() => import('@/components/graph/ForceGraph3D'), { ssr: false });

type ViewMode = 'live' | 'mock' | 'seed';
type Scope = 'my' | 'collective';

const POLL_INTERVAL = 5000;

export default function GraphPage() {
  const [data, setData] = useState<Graph3DData>({ nodes: [], links: [] });
  const [selected, setSelected] = useState<Graph3DNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mode, setMode] = useState<ViewMode>('live');
  const [scope, setScope] = useState<Scope>('collective');
  const [meta, setMeta] = useState<{ source?: string; stats?: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const prevNodeCount = useRef(0);

  const loadGraph = useCallback(async (viewMode: ViewMode, isPolling = false) => {
    if (!isPolling) {
      setLoading(true);
      setSelected(null);
    }
    try {
      const params = new URLSearchParams({ mode: viewMode, maxNodes: '200', scope });
      const res = await fetch(`/api/graph/visualize?${params}`);
      const json = await res.json();
      if (json.success) {
        const newNodes = json.data.nodes ?? [];
        const newLinks = json.data.links ?? [];

        // 새 노드 감지
        if (isPolling && newNodes.length > prevNodeCount.current) {
          setLiveCount((c) => c + (newNodes.length - prevNodeCount.current));
        }
        prevNodeCount.current = newNodes.length;

        setData({ nodes: newNodes, links: newLinks });
        setMeta(json.data._meta ?? null);
      }
    } catch {
      // 네트워크 에러 무시 (폴링 중)
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [scope]);

  // 초기 로드 + 리사이즈
  useEffect(() => {
    loadGraph(mode);
    const updateSize = () => setDimensions({
      width: window.innerWidth - 224,
      height: window.innerHeight,
    });
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [mode, scope, loadGraph]);

  // 실시간 폴링 (live 모드에서만)
  useEffect(() => {
    if (mode !== 'live') return;
    const timer = setInterval(() => loadGraph('live', true), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [mode, loadGraph]);

  return (
    <div className="relative h-screen">
      {/* 3D Graph */}
      {dimensions.width > 0 && !loading && (
        <ForceGraph3D
          data={data}
          width={dimensions.width}
          height={dimensions.height}
          onNodeClick={(node) => setSelected(node)}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/30 text-sm animate-pulse">Loading neural graph...</div>
        </div>
      )}

      {/* Stats + Controls overlay */}
      <div className="absolute top-4 left-4 glass rounded-xl px-4 py-3 text-sm space-y-3">
        {/* Brain Scope */}
        <div>
          <div className="text-white/40 text-[10px] font-mono mb-1.5">BRAIN</div>
          <div className="flex gap-1.5">
            {([
              { key: 'my' as Scope, label: 'My Brain', icon: '🧠' },
              { key: 'collective' as Scope, label: 'Collective', icon: '🌐' },
            ]).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setScope(key)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center gap-1 ${
                  scope === key
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-white/40 hover:text-white/60'
                }`}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <div className="flex gap-4">
            <span><span className="text-amber-400 font-semibold">{data.nodes.length}</span> nodes</span>
            <span><span className="text-purple-400 font-semibold">{data.links.length}</span> edges</span>
          </div>
          {meta?.source && (
            <div className="text-[10px] text-white/30 mt-1">
              Source: {meta.source}
            </div>
          )}
          {mode === 'live' && liveCount > 0 && (
            <div className="text-[10px] text-emerald-400 mt-1 animate-pulse">
              +{liveCount} new nodes this session
            </div>
          )}
        </div>

        {/* View Mode */}
        <div className="flex gap-1.5">
          {(['live', 'mock', 'seed'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setLiveCount(0); }}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition ${
                mode === m
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Node detail panel */}
      {selected && (
        <div className="absolute top-4 right-4 w-80 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: selected.color }}>{selected.name}</h3>
            <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-sm">x</button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/50">
              <span>Type</span>
              <span className="font-mono text-white/70">{selected.type}</span>
            </div>
            {selected.score !== undefined && (
              <div className="flex justify-between text-white/50">
                <span>Score</span>
                <span className="font-mono text-amber-400">{selected.score}/100</span>
              </div>
            )}
            {selected.method && (
              <div className="flex justify-between text-white/50">
                <span>Method</span>
                <span className="font-mono text-white/70">{selected.method}</span>
              </div>
            )}
            {selected.description && (
              <p className="text-white/40 text-xs mt-3 border-t border-white/5 pt-3">
                {selected.description}
              </p>
            )}
          </div>

          <button
            onClick={async () => {
              const res = await fetch(`/api/graph/search?nodeId=${selected.id}&hops=2`);
              const json = await res.json();
              if (json.success && json.data.nodes?.length > 0) {
                const neighborNodes = json.data.nodes.map((n: Record<string, unknown>) => ({
                  id: n.id,
                  name: n.title ?? n.id,
                  type: n.type ?? 'Idea',
                  val: 6,
                  color: n.type === 'Idea' ? '#FFD700' : n.type === 'Concept' ? '#4FC3F7' : '#81C784',
                }));
                const neighborLinks = json.data.edges?.map((e: Record<string, unknown>) => ({
                  source: e.source,
                  target: e.target,
                  type: e.type,
                  color: '#666',
                  width: 1,
                })) ?? [];
                setData({ nodes: neighborNodes, links: neighborLinks });
                setMeta({ source: `neighborhood of "${selected.name}"` });
              }
            }}
            className="mt-4 w-full py-2 rounded-lg text-xs bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition"
          >
            Explore Neighbors (2 hops)
          </button>
        </div>
      )}
    </div>
  );
}
