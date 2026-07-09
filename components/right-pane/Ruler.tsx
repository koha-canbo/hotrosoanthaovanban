import React from 'react';
import { PageLayoutConfig } from './PageLayoutModal';

interface RulerProps {
  config?: PageLayoutConfig;
}

export default function Ruler({ config }: RulerProps) {
  const isLandscape = config?.orientation === 'landscape';
  const widthCm = isLandscape ? 30 : 21;
  const heightCm = isLandscape ? 21 : 30;

  const mt = config?.marginTop || 20;
  const mb = config?.marginBottom || 20;
  const ml = config?.marginLeft || 30;
  const mr = config?.marginRight || 20;

  return (
    <>
      {/* Horizontal Ruler */}
      <div className="ruler-h" style={{ width: isLandscape ? '297mm' : '210mm' }}>
        {/* cm markers */}
        {Array.from({ length: widthCm + 1 }).map((_, i) => (
          <div key={i} className="ruler-cm-h" style={{ left: `${i}cm` }}>
            {i > 0 && <span className="ruler-num-h">{i}</span>}
          </div>
        ))}
        {/* Text area highlight */}
        <div className="ruler-margin-h" style={{ left: `${ml}mm`, right: `${mr}mm` }} />
      </div>

      {/* Vertical Ruler */}
      <div className="ruler-v" style={{ height: isLandscape ? '210mm' : '297mm' }}>
        {/* cm markers */}
        {Array.from({ length: heightCm + 1 }).map((_, i) => (
          <div key={i} className="ruler-cm-v" style={{ top: `${i}cm` }}>
            {i > 0 && <span className="ruler-num-v">{i}</span>}
          </div>
        ))}
        {/* Text area highlight */}
        <div className="ruler-margin-v" style={{ top: `${mt}mm`, bottom: `${mb}mm`, height: 'auto' }} />
      </div>
    </>
  );
}
