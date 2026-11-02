import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export const COULEURS = { indigo: '#2720ff', vert: '#02c377', menthe: '#b3f4db', encre: '#0e1033', orange: '#f39c12', rouge: '#e74c3c', gris: '#98a2b3' };

// Réglages communs : police de l’application, texte gris lisible en clair comme en sombre, pas de barre d’outils.
const base: ApexOptions = {
  chart: { fontFamily: 'Lexend Variable, Lexend, sans-serif', toolbar: { show: false }, foreColor: '#667085', background: 'transparent', animations: { speed: 500 } },
  grid: { borderColor: 'rgba(152,162,179,0.18)', strokeDashArray: 4 },
  dataLabels: { enabled: false },
  legend: { position: 'top', horizontalAlign: 'left', fontSize: '12px', markers: { size: 5 } },
  tooltip: { theme: 'light' },
};

const fusion = (o: ApexOptions): ApexOptions => ({ ...base, ...o, chart: { ...base.chart, ...o.chart } });

/** Activité des derniers jours : colonnes groupées par jour. */
export function GraphiqueActivite({ jours, series }: { jours: Date[]; series: { name: string; data: number[] }[] }) {
  const options = fusion({
    chart: { type: 'bar', zoom: { enabled: false } },
    colors: [COULEURS.indigo, COULEURS.vert],
    plotOptions: { bar: { columnWidth: '70%', borderRadius: 3, borderRadiusApplication: 'end' } },
    xaxis: { categories: jours.map((d) => d.toLocaleDateString('fr-HT', { day: 'numeric', month: 'short' })), tickAmount: 6, labels: { rotate: 0, style: { fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => String(Math.round(v)) } },
  });
  return <Chart options={options} series={series} type="bar" height={280} />;
}

/** Jauge circulaire (occupation des lits). */
export function Jauge({ valeur, libelle }: { valeur: number; libelle: string }) {
  const options = fusion({
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    colors: [valeur >= 90 ? COULEURS.rouge : valeur >= 75 ? COULEURS.orange : COULEURS.indigo],
    plotOptions: {
      radialBar: {
        startAngle: -110, endAngle: 110, hollow: { size: '68%' },
        track: { background: 'rgba(39,32,255,0.08)', strokeWidth: '100%' },
        dataLabels: { name: { show: true, offsetY: 26, fontSize: '12px', color: '#667085' }, value: { offsetY: -12, fontSize: '30px', fontWeight: 700, color: undefined, formatter: (v) => `${Math.round(v)} %` } },
      },
    },
    stroke: { lineCap: 'round' },
    labels: [libelle],
  });
  return <Chart options={options} series={[valeur]} type="radialBar" height={250} />;
}

/** Barres verticales (consultations par mois). */
export function GraphiqueBarres({ libelles, valeurs, nom, couleur = COULEURS.indigo, hauteur = 260 }: { libelles: string[]; valeurs: number[]; nom: string; couleur?: string; hauteur?: number }) {
  const options = fusion({
    chart: { type: 'bar' },
    colors: [couleur],
    plotOptions: { bar: { borderRadius: 5, columnWidth: '46%', borderRadiusApplication: 'end' } },
    xaxis: { categories: libelles, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px' } } },
    yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => String(Math.round(v)) } },
    legend: { show: false },
  });
  return <Chart options={options} series={[{ name: nom, data: valeurs }]} type="bar" height={hauteur} />;
}

/** Barres horizontales (âges, médecins). */
export function BarresHorizontales({ libelles, valeurs, nom, couleur = COULEURS.vert, hauteur = 240 }: { libelles: string[]; valeurs: number[]; nom: string; couleur?: string; hauteur?: number }) {
  const options = fusion({
    chart: { type: 'bar' },
    colors: [couleur],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '58%', borderRadiusApplication: 'end' } },
    xaxis: { categories: libelles, labels: { formatter: (v) => String(Math.round(Number(v))) }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: '12px' }, maxWidth: 170 } },
    dataLabels: { enabled: true, style: { fontSize: '11px', colors: ['#fff'] }, offsetX: -4 },
    legend: { show: false },
  });
  return <Chart options={options} series={[{ name: nom, data: valeurs }]} type="bar" height={hauteur} />;
}

/** Anneau (rendez-vous par statut, patients par sexe). */
export function Anneau({ libelles, valeurs, couleurs, hauteur = 250, centre }: { libelles: string[]; valeurs: number[]; couleurs: string[]; hauteur?: number; centre: string }) {
  const options = fusion({
    chart: { type: 'donut' },
    colors: couleurs,
    labels: libelles,
    stroke: { width: 2, colors: ['transparent'] },
    legend: { position: 'bottom', horizontalAlign: 'center' },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: centre, fontSize: '12px', color: '#667085', formatter: (w) => String(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)) }, value: { fontSize: '24px', fontWeight: 700 } } } } },
  });
  return <Chart options={options} series={valeurs} type="donut" height={hauteur} />;
}
