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
  
  const getGradientColor = (net: number, max: number) => {
    const ratio = Math.max(0, Math.min(1, net / max));
    let r, g, b;
    if (ratio < 0.5) {
      const pct = ratio / 0.5; // 0 to 1
      r = 232;
      g = Math.round(75 + (184 - 75) * pct);
      b = 75;
    } else {
      const pct = (ratio - 0.5) / 0.5; // 0 to 1
      r = Math.round(232 + (61 - 232) * pct);
      g = Math.round(184 + (214 - 184) * pct);
      b = Math.round(75 + (140 - 75) * pct);
    }
    return `rgba(${r}, ${g}, ${b}, 0.85)`;
  };

  const nets = subjects.map(sKey => {
    const sub = lastExam?.subjects?.find((s:any) => s.subjectKey.toLowerCase() === sKey.toLowerCase());
    return sub ? Math.max(0, sub.dogru - (sub.yanlis / 4)) : 0;
  });

  const bgColors = subjects.map((sKey, idx) => {
    const maxVal = ['Turkce', 'Matematik', 'Fen'].includes(sKey) ? 20 : 10;
    return getGradientColor(nets[idx], maxVal);
  });

  const data = {
    labels: subjects,
    datasets: [{
      label: 'Net',
      data: nets,
      backgroundColor: bgColors,
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
        const sub = lastExam?.subjects?.find((s:any) => s.subjectKey.toLowerCase() === key.toLowerCase());
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
        min: 0,
        max: 100,
        beginAtZero: true,
        angleLines: { color: '#1e2d42' },
        grid: { color: '#111827' },
        pointLabels: { color: '#617496', font: { size: 10 } },
        ticks: { display: false }
      }
    },
    plugins: { legend: { display: false }, tooltip: { ...chartTip } }
  };

  return <Radar options={options as any} data={data} />;
}

export function ComparisonRadarChart({ exam1, exam2, color }: { exam1: any, exam2: any, color: string }) {
  if (!exam1 || !exam2) return null;
  
  const subjectsKeys = ['turkce', 'inkilap', 'dinkultur', 'ingilizce', 'matematik', 'fen'];
  const labels = ['Türkçe', 'İnkılap', 'Din', 'İngilizce', 'Matematik', 'Fen'];
  const maxQ = [20, 10, 10, 10, 20, 20];

  const getDataForExam = (exam: any) => {
    return subjectsKeys.map((key, i) => {
      const sub = exam?.subjects?.find((s:any) => s.subjectKey.toLowerCase() === key.toLowerCase());
      const net = sub ? Math.max(0, sub.dogru - (sub.yanlis / 4)) : 0;
      return (net / maxQ[i]) * 100;
    });
  };

  const data = {
    labels,
    datasets: [
      {
        label: '1. Deneme (%)',
        data: getDataForExam(exam1),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        pointBackgroundColor: '#fff',
        borderWidth: 2,
        fill: true,
      },
      {
        label: '2. Deneme (%)',
        data: getDataForExam(exam2),
        backgroundColor: color + '44',
        borderColor: color,
        pointBackgroundColor: color,
        borderWidth: 2,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: {
        min: 0, max: 100, beginAtZero: true,
        angleLines: { color: '#1e2d42' },
        grid: { color: '#111827' },
        pointLabels: { color: '#617496', font: { size: 10, weight: 'bold' } },
        ticks: { display: false }
      }
    },
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: { color: '#8899bb', font: { size: 10 }, usePointStyle: true, padding: 15 } 
      },
      tooltip: { ...chartTip }
    }
  };

  return <Radar options={options as any} data={data} />;
}
export function SubjectComparisonMiniChart({ studentNets, avgNets, color }: { studentNets: Record<string, number>, avgNets: Record<string, number>, color: string }) {
  const subjects = ['turkce', 'inkilap', 'dinkultur', 'ingilizce', 'matematik', 'fen'];
  const labels = ['TR', 'İNK', 'DİN', 'İNG', 'MAT', 'FEN'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Öğrenci',
        data: subjects.map(s => studentNets[s] || 0),
        backgroundColor: color,
        borderRadius: 4,
      },
      {
        label: 'Kendi Ortalaman',
        data: subjects.map(s => avgNets[s] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: true, 
        position: 'top', 
        labels: { color: '#8899bb', font: { size: 9 }, boxWidth: 8, padding: 5 } 
      }, 
      tooltip: { ...chartTip, bodyFont: { size: 10 } } 
    },
    scales: {
      y: { min: 0, max: 20, grid: { color: '#111827' }, ticks: { color: '#4a5a7a', font: { size: 8 } } },
      x: { grid: { display: false }, ticks: { color: '#4a5a7a', font: { size: 8 } } }
    }
  };

  return <Bar options={options as any} data={data} />;
}
