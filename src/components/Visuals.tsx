/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Award, Users, AlertCircle, FileText, Calendar } from 'lucide-react';

// Interfaces for Visuals
interface CurvePoint {
  label: string;
  value: number;
}

// 1. Attendance Trend Curve (Smooth SVG Line Chart)
export function AttendanceTrendChart({ data, title }: { data: CurvePoint[]; title: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Max and Min values for Y-axis (scale from 50 to 100 or min to max)
  const values = data.map((d) => d.value);
  const maxVal = 100;
  const minVal = Math.max(0, Math.min(...values) - 10); // scale slightly below the lowest value to emphasise trends

  // Map data to coordinates
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  // Build the SVG path (using catmull-rom or simple cubic bezier)
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  // Draw fill below the line
  const fillD = pathD ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500">Tren kehadiran siswa harian seluruh kelas (%)</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          +0.8% minggu ini
        </div>
      </div>

      <div className="relative w-full aspect-[21/9] sm:aspect-auto sm:h-52">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + chartHeight * ratio;
            const val = Math.round(maxVal - ratio * (maxVal - minVal));
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize={9}
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area under the path */}
          {fillD && (
            <path
              d={fillD}
              fill="url(#trendGrad)"
              className="transition-all duration-300"
            />
          )}

          {/* Core path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#0f766e" // Teal 700
              strokeWidth={3}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )}

          {/* Data Nodes/Points */}
          {points.map((p, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <g key={index} className="cursor-pointer">
                {/* Visual guideline when hovered */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="#14b8a6"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                )}
                {/* Outer pulsing ring on hover */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 10 : 0}
                  fill="#e0f2fe"
                  className="transition-all duration-200 opacity-60"
                />
                {/* Main point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#0f766e' : '#14b8a6'}
                  stroke="#ffffff"
                  strokeWidth={2}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* X axis labels */}
          {points.map((p, index) => (
            <text
              key={index}
              x={p.x}
              y={height - paddingY + 16}
              fill="#64748b"
              fontSize={10}
              fontWeight="500"
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}

          {/* Defs for gradient */}
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.00" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bg-slate-900 text-white rounded-lg p-2 text-xs shadow-md pointer-events-none z-10 bottom-16 border border-slate-800"
              style={{
                left: `${((points[hoveredIndex].x - paddingX) / chartWidth) * 80 + 10}%`
              }}
            >
              <div className="font-semibold text-teal-400">{points[hoveredIndex].label}</div>
              <div>Rata Kehadiran: <span className="font-mono font-bold text-slate-100">{points[hoveredIndex].value}%</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// 2. Attendance Summary Donut Chart
export function AttendanceSummaryDonut({
  hadir,
  sakit,
  izin,
  alfa,
}: {
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
}) {
  const total = hadir + sakit + izin + alfa;
  const rates = {
    hadir: total > 0 ? (hadir / total) * 100 : 0,
    sakit: total > 0 ? (sakit / total) * 100 : 0,
    izin: total > 0 ? (izin / total) * 100 : 0,
    alfa: total > 0 ? (alfa / total) * 100 : 0,
  };

  const radius = 50;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const getStrokeDashOffset = (percentage: number) => {
    return circumference - (percentage / 100) * circumference;
  };

  // Stacked rings computation
  const dataList = [
    { name: 'Hadir', count: hadir, percent: rates.hadir, color: '#10b981', bg: 'bg-emerald-500' },
    { name: 'Sakit', count: sakit, percent: rates.sakit, color: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Izin', count: izin, percent: rates.izin, color: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Alfa', count: alfa, percent: rates.alfa, color: '#ef4444', bg: 'bg-red-500' },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col items-center h-full">
      <div className="w-full text-left mb-4">
        <h4 className="text-sm font-semibold text-slate-800">Distribusi Kehadiran</h4>
        <p className="text-xs text-slate-500">Persentase status absensi kumulatif</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around w-full gap-4 py-2">
        <div className="relative flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Base Circle background */}
            <circle
              stroke="#f1f5f9"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {total > 0 &&
              dataList.map((item, idx) => {
                const dashOffset = getStrokeDashOffset(item.percent);
                const rotation = (accumulatedPercent / 100) * 360;
                accumulatedPercent += item.percent;

                return (
                  <circle
                    key={idx}
                    stroke={item.color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{
                      strokeDashoffset: dashOffset,
                      transformOrigin: 'center',
                      transform: `rotate(${rotation}deg)`,
                      transition: 'all 0.5s ease-out'
                    }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                    className="hover:opacity-80 cursor-pointer"
                  />
                );
              })}
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {total > 0 ? Math.round((hadir / total) * 100) : 0}%
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Kehadiran</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full max-w-[160px] sm:max-w-none">
          {dataList.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
                <span className="font-semibold text-slate-600">{item.name}</span>
              </div>
              <div className="flex gap-1.5 font-mono">
                <span className="font-bold text-slate-700">{item.count}</span>
                <span className="text-slate-400">({Math.round(item.percent)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Class Performance Bar Chart Comparison
export function ClassComparisonBarChart({
  classesData,
}: {
  classesData: { name: string; attendanceRate: number; journalCount: number }[];
}) {
  const maxAttendance = 100;
  const height = 180;

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-100 flex flex-col h-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-800">Komparasi Antar Kelas</h4>
        <p className="text-xs text-slate-500">Rasio absensi (%) & volume jurnal guru pengampu</p>
      </div>

      <div className="flex items-end justify-between gap-4 h-36 pt-4 border-b border-slate-100">
        {classesData.map((cls, idx) => {
          const heightPercent = `${(cls.attendanceRate / maxAttendance) * 100}%`;
          return (
            <div key={idx} className="flex flex-col items-center flex-1 group">
              <div className="w-full flex justify-center items-end gap-1.5 h-24 mb-2 relative">
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 bg-slate-900 text-[10px] text-white py-1 px-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 flex flex-col items-center">
                  <span>Hadir: {cls.attendanceRate}%</span>
                  <span>Jurnal: {cls.journalCount}</span>
                </div>

                {/* Journal Volume indicators */}
                <div className="flex flex-col items-center justify-end w-2.5">
                  <div className="text-[10px] font-bold text-slate-400 font-mono mb-0.5">{cls.journalCount}</div>
                  <div
                    style={{ height: `${Math.min(90, cls.journalCount * 12)}px` }}
                    className="w-full bg-slate-300 group-hover:bg-teal-500 rounded-t-xs transition-colors duration-200"
                  />
                </div>

                {/* Attendance rate bar */}
                <div className="flex flex-col items-center justify-end w-6 h-full">
                  <div className="text-[10px] font-bold text-emerald-600 font-mono mb-0.5">{cls.attendanceRate}%</div>
                  <div
                    style={{ height: heightPercent }}
                    className="w-full bg-emerald-100 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 flex items-end justify-center"
                  >
                    <div className="w-full h-1/2 bg-emerald-200/50 group-hover:bg-emerald-600/30 rounded-t-md" />
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600 truncate max-w-[84px] text-center">{cls.name}</span>
            </div>
          );
        })}
      </div>

      {/* Legend indicator */}
      <div className="flex justify-center items-center gap-4 mt-3 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-1.5 bg-emerald-400 rounded-xs" />
          <span>Rata Kehadiran (%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-3 bg-slate-300 rounded-t-xs" />
          <span>Jumlah Buku Jurnal</span>
        </div>
      </div>
    </div>
  );
}

// 4. Metric Highlights Widgets
export function MetricCard({
  value,
  title,
  sub,
  percentChange,
  isPositive = true,
  icon: IconComponent,
  iconColor,
}: {
  value: string | number;
  title: string;
  sub: string;
  percentChange?: string;
  isPositive?: boolean;
  icon: any;
  iconColor: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between transition-all"
    >
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase block">{title}</span>
        <div className="flex items-end gap-2.5">
          <span className="text-3xl font-black text-slate-800 tracking-tight font-mono leading-none">{value}</span>
          {percentChange && (
            <span
              className={`text-xs font-bold leading-none pb-1 ${
                isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {isPositive ? '↑' : '↓'} {percentChange}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-medium">{sub}</p>
      </div>

      <div className={`p-3.5 rounded-xl ${iconColor}`}>
        <IconComponent className="w-6 h-6" />
      </div>
    </motion.div>
  );
}
