"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { STAT_DEFINITIONS } from "./stat-definitions";

const SetHoveredStatContext = createContext<(statKey: string | null) => void>(() => {});
const ReportColumnLeftContext = createContext<(left: number) => void>(() => {});

export function useSetHoveredStat() {
  return useContext(SetHoveredStatContext);
}

export function useReportStatColumnLeft() {
  return useContext(ReportColumnLeftContext);
}

export function StatInfoProvider({ children }: { children: ReactNode }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [leftOffset, setLeftOffset] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const def = hoveredKey ? STAT_DEFINITIONS[hoveredKey] : undefined;

  const reportColumnLeft = useCallback((left: number) => {
    const wrapperLeft = wrapperRef.current?.getBoundingClientRect().left ?? 0;
    setLeftOffset(Math.max(left - wrapperLeft, 0));
  }, []);

  return (
    <SetHoveredStatContext.Provider value={setHoveredKey}>
      <ReportColumnLeftContext.Provider value={reportColumnLeft}>
        <div ref={wrapperRef}>
          <div
            className="sticky top-0 z-30 mb-8 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            style={{ marginLeft: leftOffset }}
          >
            {def ? (
              <>
                <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {def.label}
                </p>
                <p className="mb-1.5">
                  <span className="font-medium">What it is: </span>
                  {def.simple}
                </p>
                <p className={def.scale ? "mb-1.5" : ""}>
                  <span className="font-medium">What it tells you: </span>
                  {def.abstract}
                </p>
                {def.scale && (
                  <div className="border-t border-gray-200 pt-1.5 dark:border-gray-700">
                    <p className="mb-0.5 font-medium">Scale:</p>
                    <ul className="space-y-0">
                      {def.scale.map((tier) => (
                        <li key={tier.label}>
                          {tier.emoji} {tier.label}: {tier.range}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400">Hover a stat name below to see what it measures.</p>
            )}
          </div>
          {children}
        </div>
      </ReportColumnLeftContext.Provider>
    </SetHoveredStatContext.Provider>
  );
}
