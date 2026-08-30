import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode, { CustomStageStatus } from './CustomNode';
import { RoadmapStageSummary } from '../../services/roadmap.service';

interface RoadmapCanvasProps {
  stages: RoadmapStageSummary[] | any[];
  selectedStageId: number | null;
  onSelectStage: (id: number) => void;
  isDarkMode?: boolean;
}

const nodeTypes = {
  custom: CustomNode,
};

// S-Curve layout coordinates (X, Y) for 10 nodes (3 columns width)
const getCoordinates = (index: number) => {
  const row = Math.floor(index / 3);
  const col = index % 3;
  
  // If even row, left to right. If odd row, right to left.
  const isEvenRow = row % 2 === 0;
  const x = isEvenRow ? col * 350 : (2 - col) * 350;
  const y = row * 220;
  
  return { x, y };
};

export const RoadmapCanvas: React.FC<RoadmapCanvasProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
  isDarkMode = false,
}) => {
  const initialNodes: Node[] = useMemo(() => {
    return stages.map((stage, index) => {
      const isFinalCapstone = index === stages.length - 1;
      const status: CustomStageStatus = (stage.status as CustomStageStatus) || 'LOCKED';

      return {
        id: stage.id.toString(),
        type: 'custom',
        position: getCoordinates(index),
        data: {
          title: stage.title,
          stageId: stage.id,
          status,
          difficulty: stage.difficulty || 'Intermediate',
          duration: stage.estimated_duration || stage.estimatedDuration || '4 Weeks',
          isFinalCapstone: isFinalCapstone || stage.is_final_capstone,
        },
      };
    });
  }, [stages]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const currentStatus = stages[i].status;
      const nextStatus = stages[i + 1].status;
      
      const isCompleted = currentStatus === 'COMPLETED';
      const isNextActive = nextStatus === 'IN_PROGRESS';
      const isSelectedPath = selectedStageId === stages[i + 1].id;
      
      const isAnimated = isCompleted && isNextActive;
      const strokeColor = isSelectedPath
        ? '#ea580c'
        : isCompleted
        ? '#10b981'
        : isNextActive
        ? '#ea580c'
        : isDarkMode ? '#334155' : '#e2e8f0';

      const strokeWidth = isSelectedPath ? 3 : isCompleted || isNextActive ? 2 : 1.5;

      edges.push({
        id: `e${stages[i].id}-${stages[i + 1].id}`,
        source: stages[i].id.toString(),
        target: stages[i + 1].id.toString(),
        type: 'smoothstep',
        animated: isAnimated,
        style: { stroke: strokeColor, strokeWidth },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
      });
    }
    return edges;
  }, [stages, selectedStageId, isDarkMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when stages or selection change
  useEffect(() => {
    setNodes(initialNodes.map((n) => ({
      ...n,
      selected: n.id === selectedStageId?.toString(),
    })));
  }, [initialNodes, selectedStageId, setNodes]);

  // Sync edges when selection or stages change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectStage(Number(node.id));
    },
    [onSelectStage]
  );

  return (
    <div className="w-full h-[600px] bg-[#f8fafc] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        colorMode={isDarkMode ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={isDarkMode ? "#334155" : "#cbd5e1"} gap={24} size={1} />
        <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm" showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

