'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
      y: { min: 400, max: 500, ticks: { color: '#4a5a7a', font: { size: 10 } }, grid: { color: '#111827' } }
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
