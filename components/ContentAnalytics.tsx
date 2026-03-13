import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AnalysisData, SegmentItem, VocabularyItem } from '../types';
import { BarChart2, PieChart as PieChartIcon, TrendingUp, Info } from 'lucide-react';

interface ContentAnalyticsProps {
  analysisData: AnalysisData | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Info size={48} className="mb-4 opacity-50" />
        <p>尚無分析數據可供顯示。</p>
      </div>
    );
  }

  // 1. Vocabulary Complexity (Simulated by Word Length)
  const vocabData = analysisData.vocabulary.reduce((acc, item) => {
    const length = item.word.length;
    const key = `${length}字詞`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vocabChartData = Object.entries(vocabData).map(([name, count]) => ({
    name,
    count,
  })).sort((a, b) => a.name.localeCompare(b.name));

  // 2. Segment Complexity (Based on Summary Length)
  const segmentData = analysisData.segments.map((seg, index) => ({
    name: `段落 ${index + 1}`,
    length: seg.summary.length,
    keywords: seg.keywords.length,
  }));

  // 3. Rhetoric Usage Distribution
  const rhetoricCounts: Record<string, number> = {};
  analysisData.segments.forEach(seg => {
    seg.rhetorics.forEach(r => {
      // Extract rhetoric type from name (e.g., "排比 (Parallelism)" -> "排比")
      const type = r.name.split(' ')[0] || r.name;
      rhetoricCounts[type] = (rhetoricCounts[type] || 0) + 1;
    });
  });

  const rhetoricChartData = Object.entries(rhetoricCounts).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            教學成效分析儀表板 (Learning Analytics)
          </h2>
          <p className="text-indigo-700/80 text-sm mt-1">
            基於 AI 生成內容的結構化數據分析，協助評估教材難度與教學重點分佈。
          </p>
        </div>
        <div className="flex gap-2 text-xs font-mono text-indigo-600 bg-white/50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <span>總詞彙量: {analysisData.vocabulary.length}</span>
            <span>•</span>
            <span>總段落數: {analysisData.segments.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Vocabulary Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <BarChart2 size={18} className="text-emerald-500" />
              詞彙結構分佈 (Vocabulary Structure)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vocabChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="count" name="詞彙數量" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            分析詞彙長度分佈，長詞通常代表較高的認知複雜度。
          </p>
        </div>

        {/* Chart 2: Rhetoric Usage */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <PieChartIcon size={18} className="text-purple-500" />
              修辭技巧運用 (Rhetoric Usage)
            </h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {rhetoricChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rhetoricChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {rhetoricChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">無修辭數據</div>
            )}
          </div>
           <p className="text-xs text-slate-400 mt-4 text-center">
            顯示教材中運用的修辭技巧比例，反映文本的文學性與教學重點。
          </p>
        </div>

        {/* Chart 3: Segment Complexity Flow */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              段落認知負荷流 (Cognitive Load Flow)
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} padding={{left: 20, right: 20}}/>
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} tick={{fill: '#3b82f6', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" axisLine={false} tickLine={false} tick={{fill: '#f59e0b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="length" name="摘要長度 (字數)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="keywords" name="關鍵概念數" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            雙軸圖表：藍線代表段落摘要長度（閱讀量），黃線代表關鍵概念數量（認知密度）。
            波峰處通常是教學難點，波谷則是過渡或鋪陳段落。
          </p>
        </div>

      </div>
    </div>
  );
};

export default ContentAnalytics;
