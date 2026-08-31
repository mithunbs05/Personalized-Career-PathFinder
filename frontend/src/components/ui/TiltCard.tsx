import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility to merge tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glareClassName?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className, glareClassName }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);
  
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
    
    setMousePosition({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
    });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-[#1A1A18]/60 backdrop-blur-md overflow-hidden transition-colors duration-300",
        className
      )}
    >
      {/* Glare effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-50 opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100",
          glareClassName
        )}
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.15), transparent 60%)`,
        }}
      />
      
      {/* Content wrapper with preserve-3d to allow children to translateZ */}
      <div className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};
