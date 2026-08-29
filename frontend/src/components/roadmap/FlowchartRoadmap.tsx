import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RoadmapStage } from '../../types/roadmap';
import { RoadmapNode } from './RoadmapNode';

interface FlowchartRoadmapProps {
  stages: RoadmapStage[];
  selectedStageId?: number;
  onStageSelect: (stage: RoadmapStage) => void;
}

const nodeTypes: NodeTypes = {
  roadmapNode: RoadmapNode,
};

export const FlowchartRoadmap: React.FC<FlowchartRoadmapProps> = ({
  stages,
  selectedStageId,
  onStageSelect,
}) => {
  // Generate nodes and edges dynamically based on stages
  const initialNodes = useMemo(() => {
    return stages.map((stage, index) => {
      // Calculate a snaking layout (like an S-curve)
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = row % 2 === 0 ? col * 400 : (2 - col) * 400;
      const y = row * 200;

      return {
        id: stage.id.toString(),
        type: 'roadmapNode',
        position: { x, y },
        data: {
          stage,
          index,
          isSelected: selectedStageId === stage.id,
          onClick: onStageSelect,
        },
      };
    });
  }, [stages, selectedStageId, onStageSelect]);

  const initialEdges = useMemo(() => {
    const edges = [];
    for (let i = 0; i < stages.length - 1; i++) {
      const sourceId = stages[i].id.toString();
      const targetId = stages[i + 1].id.toString();
      const isCompleted = stages[i].status === 'COMPLETED';

      edges.push({
        id: `e${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        animated: isCompleted, // Animate the edges connecting completed nodes to current ones
        style: {
          stroke: isCompleted ? '#FF4D31' : '#E8E6DE',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCompleted ? '#FF4D31' : '#E8E6DE',
        },
      });
    }
    return edges;
  }, [stages]);

  return (
    <div className="w-full h-[600px] bg-white dark:bg-[#121211] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] overflow-hidden">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={2} 
          color="rgba(122, 139, 124, 0.2)" 
        />
        <Controls 
          className="bg-white dark:bg-[#1A1A18] border-[#E8E6DE] dark:border-[#2C2C29] fill-[#1A1A1A] dark:fill-white" 
        />
      </ReactFlow>
    </div>
  );
};
