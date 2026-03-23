'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { generateMockGraph } from '@/lib/mock-graph';
import type { Graph3DData, Graph3DNode } from '@/types/graph';

const ForceGraph3D = dynamic(() => import('@/components/graph/ForceGraph3D'), { ssr: false });

export default function GraphPage() {
  const [data, setData] = useState<Graph3DData>({ nodes: [], links: [] });
  const [selected, setSelected] = useState<Graph3DNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // TODO: Replace with Memgraph API call
    setData(generateMockGraph(100, 150));
    const updateSize = () => setDimensions({
      width: window.innerWidth - 224, // sidebar width
      height: window.innerHeight,
    });
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative h-screen">
      {/* 3D Graph */}
      {dimensions.width > 0 && (
        <ForceGraph3D
          data={data}
          width={dimensions.width}
          height={dimensions.height}
          onNodeClick={(node) => setSelected(node)}
        />
      )}

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 glass rounded-lg px-4 py-3 text-sm">
        <div className="text-white/40 text-xs font-mono mb-1">GRAPH</div>
        <div className="flex gap-4">
          <span><span className="text-amber-400 font-semibold">{data.nodes.length}</span> nodes</span>
          <span><span className="text-purple-400 font-semibold">{data.links.length}</span> edges</span>
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
        </div>
      )}
    </div>
  );
}
