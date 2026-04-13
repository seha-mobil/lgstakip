'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Filler
);

const chartTip = {
  backgroundColor:'#111827', borderColor:'#1e2d42', borderWidth:1,
  titleColor:'#e8f0fe', bodyColor:'#8899bb', padding:10, cornerRadius:8
};

export function ProgressChart({ exams, color }: { exams: any[], color: string }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...chartTip }
    },
    scales: {
      x: { grid: { color: '#111827' }, ticks: { color: '#4a5a7a', font: { size: 10 } } },
      y: { min: 300, max: 500, ticks: { color: '#4a5a7a', font: { size: 10 } }, grid: { color: '#111827' } }
    }
  };

  const data = {
    labels: exams.map(e => new Date(e.date).toLocaleDateString('tr-TR')),
    datasets: [{
      label: 'LGS Puanı',
      data: exams.map(e => e.lgsPuani),
      borderColor: color,
      backgroundColor: color + '18',
      fill: true, tension: 0.4,
      pointBackgroundColor: color,
      pointBorderColor: '#080c14',
      pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, borderWidth: 2.5
    }]
  };

  return <Line options={options as any} data={data} />;
}

export function SubjectBarChart({ exams, subjects, title, color }: { exams: any[], subjects: string[], title: string, color: string }) {
  const lastExam = exams[exams.length - 1];
  const data = {
    labels: subjects,
    datasets: [{
      label: 'Net',
      data: subjects.map(sKey => {
        const sub = lastExam?.subjects?.find((s:any) => s.subjectKey === sKey.toLowerCase());
        return sub ? Math.max(0, sub.dogru - (sub.yanlis / 4)) : 0;
      }),
      backgroundColor: color + 'cc',
      borderRadius: 6
    }]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...chartTip } },
    scales: {
      y: { min: 0, max: 20, grid: { color: '#111827' }, ticks: { color: '#4a5a7a' } },
      x: { grid: { display: false }, ticks: { color: '#4a5a7a' } }
    }
  };

  return <Bar options={options as any} data={data} />;
}

export function NetRadarChart({ exams, color }: { exams: any[], color: string }) {
  if (!exams.length) return null;
  const lastExam = exams[exams.length - 1];
  
  const subjectsKeys = ['turkce', 'inkilap', 'dinkultur', 'ingilizce', 'matematik', 'fen'];
  const labels = ['Türkçe', 'İnkılap', 'Din', 'İngilizce', 'Matematik', 'Fen'];
  const maxQ = [20, 10, 10, 10, 20, 20];

  const data = {
    labels,
    datasets: [{
      label: 'Net Yüzdesi (%)',
      data: subjectsKeys.map((key, i) => {
        const sub = lastExam?.subjects?.find((s:any) => s.subjectKey === key);
        const net = sub ? Math.max(0, sub.dogru - (sub.yanlis / 4)) : 0;
        return (net / maxQ[i]) * 100;
      }),
      backgroundColor: color + '33',
      borderColor: color,
      pointBackgroundColor: color,
      borderWidth: 2,
    }]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: '#1e2d42' },
        grid: { color: '#111827' },
        pointLabels: { color: '#617496', font: { size: 10 } },
        ticks: { display: false, min: 0, max: 100 }
      }
    },
    plugins: { legend: { display: false }, tooltip: { ...chartTip } }
  };

  return <Radar options={options as any} data={data} />;
}

