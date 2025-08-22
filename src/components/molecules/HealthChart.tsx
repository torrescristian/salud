import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MeasurementPoint {
  timestamp: string;
  value: number;
}

interface HealthChartProps {
  title: string;
  data: MeasurementPoint[];
  unit: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  minValue?: number;
  maxValue?: number;
  className?: string;
}

export const HealthChart = ({
  title,
  data,
  unit,
  color,
  backgroundColor,
  borderColor,
  minValue,
  maxValue,
  className = "",
}: HealthChartProps) => {
  // Ordenar datos por timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const chartData = {
    labels: sortedData.map((point) => {
      const date = parseISO(point.timestamp);
      return format(date, "dd/MM", { locale: es });
    }),
    datasets: [
      {
        label: title,
        data: sortedData.map((point) => point.value),
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        borderWidth: 3,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: color,
        font: {
          size: 18,
          weight: "bold" as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          label: (context: { parsed: { y: number } }) => {
            return `${context.parsed.y} ${unit}`;
          },
          title: (tooltipItems: { dataIndex: number }[]) => {
            const index = tooltipItems[0].dataIndex;
            const timestamp = sortedData[index].timestamp;
            const date = parseISO(timestamp);
            return format(date, "EEEE, d 'de' MMMM 'a las' HH:mm", {
              locale: es,
            });
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Fecha",
          color: "#6B7280",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: "#6B7280",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
        },
        ...(minValue !== undefined && { min: minValue }),
        ...(maxValue !== undefined && { max: maxValue }),
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No hay datos para mostrar
        </h3>
        <p className="text-gray-500">
          Comienza agregando mediciones para ver el gráfico
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="h-80 w-full">
        <Line data={chartData} options={options} />
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">Última</p>
          <p className="text-lg font-semibold" style={{ color }}>
            {sortedData[sortedData.length - 1]?.value} {unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Promedio</p>
          <p className="text-lg font-semibold" style={{ color }}>
            {Math.round(
              sortedData.reduce((sum, point) => sum + point.value, 0) /
                sortedData.length
            )}{" "}
            {unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tendencia</p>
          <p className="text-lg font-semibold" style={{ color }}>
            {sortedData.length >= 2
              ? sortedData[sortedData.length - 1].value >
                sortedData[sortedData.length - 2].value
                ? "↗️"
                : "↘️"
              : "➖"}
          </p>
        </div>
      </div>
    </div>
  );
};
