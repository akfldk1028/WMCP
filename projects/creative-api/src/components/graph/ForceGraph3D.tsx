'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import type { Graph3DData, Graph3DNode } from '@/types/graph';
import { GRAPH_BG, NODE_STYLES, EDGE_STYLES, getEdgeStyle, BLOOM_CONFIG, CAMERA_CONFIG } from '@/config/graph-styles';

// react-force-graph-3d는 SSR 불가 → next/dynamic으로 로드
// 이 컴포넌트 자체가 'use client'이고, 부모에서 dynamic import
interface ForceGraph3DProps {
  data: Graph3DData;
  width?: number;
  height?: number;
  onNodeClick?: (node: Graph3DNode) => void;
  onNodeHover?: (node: Graph3DNode | null) => void;
  autoRotate?: boolean;
  showLabels?: boolean;
}

export default function ForceGraph3DComponent({
  data,
  width,
  height,
  onNodeClick,
  onNodeHover,
  autoRotate = true,
  showLabels = true,
}: ForceGraph3DProps) {
  const graphRef = useRef<any>(null);
  const [ForceGraph, setForceGraph] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Dynamic import (브라우저 전용)
  useEffect(() => {
    import('react-force-graph-3d').then((mod) => {
      setForceGraph(() => mod.default);
    });
  }, []);

  // 자동 회전
  useEffect(() => {
    if (!graphRef.current || !autoRotate) return;
    const controls = graphRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = CAMERA_CONFIG.autoRotateSpeed;
    }
  }, [autoRotate, ForceGraph]);

  // Bloom 후처리
  useEffect(() => {
    if (!graphRef.current) return;
    const renderer = graphRef.current.renderer();
    if (!renderer) return;

    // Three.js post-processing (UnrealBloomPass)
    import('three/examples/jsm/postprocessing/EffectComposer.js').then(({ EffectComposer }) => {
      import('three/examples/jsm/postprocessing/RenderPass.js').then(({ RenderPass }) => {
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js').then(({ UnrealBloomPass }) => {
          import('three').then((THREE) => {
            const scene = graphRef.current.scene();
            const camera = graphRef.current.camera();

            const composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));
            composer.addPass(
              new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                BLOOM_CONFIG.strength,
                BLOOM_CONFIG.radius,
                BLOOM_CONFIG.threshold
              )
            );

            // 렌더 루프 교체
            graphRef.current.postProcessingComposer(composer);
          });
        });
      });
    }).catch(() => {
      // post-processing 없이 fallback
    });
  }, [ForceGraph]);

  const handleNodeClick = useCallback((node: any) => {
    // 카메라 줌인
    if (graphRef.current) {
      const distance = 80;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      graphRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        1500
      );
    }
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node?.id ?? null);
    onNodeHover?.(node ?? null);
    // 커서 변경
    if (typeof document !== 'undefined') {
      document.body.style.cursor = node ? 'pointer' : 'default';
    }
  }, [onNodeHover]);

  if (!ForceGraph) {
    return (
      <div className="flex items-center justify-center" style={{ width: width || '100%', height: height || '100vh', background: GRAPH_BG }}>
        <div className="text-white/40 text-lg font-mono pulse-glow">Loading graph...</div>
      </div>
    );
  }

  return (
    <div className="graph-canvas">
      <ForceGraph
        ref={graphRef}
        graphData={data}
        width={width}
        height={height}
        backgroundColor={GRAPH_BG}
        // 노드
        nodeVal={(node: Graph3DNode) => node.val}
        nodeColor={(node: Graph3DNode) => {
          if (hoveredNode && hoveredNode !== node.id) {
            // 연결되지 않은 노드 dimming
            const isLinked = data.links.some(
              (l) =>
                (l.source === hoveredNode && l.target === node.id) ||
                (l.target === hoveredNode && l.source === node.id)
            );
            return isLinked ? node.color : 'rgba(255,255,255,0.08)';
          }
          return node.color;
        }}
        nodeLabel={showLabels ? (node: Graph3DNode) => `
          <div style="background:rgba(0,0,0,0.85);padding:8px 12px;border-radius:8px;border:1px solid ${node.color};max-width:250px;">
            <div style="color:${node.color};font-weight:600;font-size:13px;">${node.name}</div>
            <div style="color:#999;font-size:11px;margin-top:4px;">${node.type}${node.score ? ` · Score: ${node.score}` : ''}</div>
            ${node.description ? `<div style="color:#ccc;font-size:11px;margin-top:4px;">${node.description.slice(0, 100)}...</div>` : ''}
          </div>
        ` : undefined}
        nodeOpacity={0.9}
        // 엣지
        linkColor={(link: any) => {
          const style = getEdgeStyle(link.type);
          return style?.color ?? '#333';
        }}
        linkWidth={(link: any) => {
          const style = getEdgeStyle(link.type);
          return style?.width ?? 1;
        }}
        linkDirectionalParticles={(link: any) => {
          const style = getEdgeStyle(link.type);
          return style?.particles ?? 0;
        }}
        linkDirectionalParticleSpeed={(link: any) => {
          const style = getEdgeStyle(link.type);
          return style?.particleSpeed ?? 0;
        }}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={(link: any) => {
          const style = getEdgeStyle(link.type);
          return style?.color ?? '#666';
        }}
        linkOpacity={0.6}
        // 인터랙션
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        // 물리엔진
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTime={3000}
      />
    </div>
  );
}
