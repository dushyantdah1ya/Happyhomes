import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  withShadow?: boolean;
}

/**
 * Modern Architectural Logo for Happy Homes
 * Strictly adhering to the website's monochrome architectural color palette:
 * Obsidian Charcoal (#141414), Titanium White (#FFFFFF), and Architectural Greys.
 * No external or garish colors.
 */
export function LogoMark({ 
  className = "w-8 h-8", 
  variant = "light",
  style
}: { 
  className?: string; 
  variant?: 'light' | 'dark' | 'color';
  style?: React.CSSProperties;
}) {
  const isDark = variant === 'dark';
  
  // Dynamic architectural palette
  const primaryStroke = isDark ? "#1A1A1A" : "#FFFFFF";
  const secondaryTone = isDark ? "#1A1A1A" : "#FFFFFF";
  const hairlineTone = isDark ? "rgba(26, 26, 26, 0.25)" : "rgba(255, 255, 255, 0.25)";

  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`shrink-0 ${className}`}
      style={style}
      aria-label="Happy Homes Architectural Crest"
    >
      {/* Precision Modernist Architectural Parapet / Finial */}
      <path 
        d="M65 17V33L74 41.5V17H65Z" 
        fill={primaryStroke}
      />

      {/* Main Architectural Gable Chevron */}
      <path 
        d="M6 50L50 11L94 50L87 56L50 23.5L13 56L6 50Z" 
        fill={primaryStroke}
      />

      {/* Substructure / Pediment Hairline Base */}
      <rect 
        x="18" 
        y="50" 
        width="64" 
        height="1.5" 
        fill={primaryStroke} 
        opacity={0.25} 
      />

      {/* LEFT 'H' */}
      {/* Left upright column */}
      <rect 
        x="21" 
        y="42" 
        width="10.5" 
        height="46" 
        fill={primaryStroke}
      />

      {/* Crossbar */}
      <rect 
        x="21" 
        y="59" 
        width="27" 
        height="9" 
        fill={primaryStroke}
      />

      {/* Right upright column with signature 45° architectural chamfer */}
      <path 
        d="M37.5 42H48V72.5L41.5 88H37.5V42Z" 
        fill={primaryStroke}
      />

      {/* Chamfer notch shadow line (architectural relief) */}
      <path 
        d="M41.5 73.5L47.5 88H42L37.5 77.5V73.5H41.5Z" 
        fill={isDark ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.25)"} 
      />

      {/* RIGHT 'H' (Rendered in architectural balance) */}
      {/* Left upright column */}
      <rect 
        x="54.5" 
        y="50" 
        width="10.5" 
        height="44" 
        fill={secondaryTone}
      />

      {/* Crossbar */}
      <rect 
        x="54.5" 
        y="65" 
        width="26" 
        height="9" 
        fill={secondaryTone}
      />

      {/* Right upright column */}
      <rect 
        x="70" 
        y="50" 
        width="10.5" 
        height="44" 
        fill={secondaryTone}
      />

      {/* Micro baseline grounding rule */}
      <rect 
        x="21" 
        y="92" 
        width="59.5" 
        height="1.5" 
        fill={hairlineTone} 
      />
    </svg>
  );
}

export default function Logo({
  variant = 'light',
  size = 'md',
  showWordmark = true,
  showSubtitle = true,
  subtitle = "ESTATE ADVISORY · JAIPUR",
  className = "",
  onClick,
  withShadow = false
}: LogoProps) {
  // Size metrics
  const sizeMap = {
    sm: { icon: "w-7 h-7", title: "text-[14px]", sub: "text-[8px] tracking-[0.25em]" },
    md: { icon: "w-9 h-9", title: "text-[16px]", sub: "text-[9px] tracking-[0.28em]" },
    lg: { icon: "w-11 h-11", title: "text-[20px]", sub: "text-[10px] tracking-[0.3em]" },
    xl: { icon: "w-14 h-14", title: "text-[26px]", sub: "text-[11px] tracking-[0.35em]" }
  };

  const { icon, title, sub } = sizeMap[size];

  const isDark = variant === 'dark';
  
  // Set logo elements based on variant
  const primaryTextColor = isDark ? "#1A1A1A" : "#FFFFFF";
  const secondaryTextColor = isDark ? "#1A1A1A" : "#FFFFFF";
  const subTextColor = isDark ? "#737373" : "rgba(255, 255, 255, 0.7)";
  
  // Apply white glow for black text legibility in hero mode (when withShadow is true)
  // Only applies when design is dark/black text sitting on hero background
  const textShadowStyle = withShadow && isDark ? { textShadow: "0 0 8px rgba(255,255,255,0.8), 0 0 2px rgba(255,255,255,0.9)" } : {};
  const textShadowClass = "";

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      <LogoMark className={icon} variant={variant} style={textShadowStyle} />

      {showWordmark && (
        <div className={`flex flex-col justify-center leading-none ${textShadowClass}`}>
          <div 
            className={`font-semibold tracking-[-0.01em] uppercase ${title} flex items-center`}
            style={textShadowStyle}
          >
            <span style={{ color: primaryTextColor }}>Happy</span>
            <span className="ml-1.5 font-light" style={{ color: secondaryTextColor }}>Homes</span>
          </div>

          {showSubtitle && (
            <span 
              className={`font-mono uppercase font-normal mt-1 block ${sub}`} 
              style={{ color: subTextColor, ...textShadowStyle }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
