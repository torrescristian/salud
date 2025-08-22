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
import ChartDataLabels from "chartjs-plugin-datalabels";
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
  Filler,
  ChartDataLabels
);

interface MeasurementPoint {
  timestamp: string;
  value: number;
}

interface Dataset {
  label: string;
  data: MeasurementPoint[];
  color: string;
  backgroundColor: string;
  borderColor: string;
}

interface HealthChartProps {
  datasets: Dataset[];
  unit: string;
  minValue?: number;
  maxValue?: number;
  className?: string;
}

export const HealthChart = ({
  datasets,
  unit,
  minValue,
  maxValue,
  className = "",
}: HealthChartProps) => {
  // Ordenar todos los datasets por timestamp
  const allTimestamps = datasets.flatMap((dataset) =>
    dataset.data.map((point) => point.timestamp)
  );
  const uniqueTimestamps = [...new Set(allTimestamps)].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const chartData = {
    labels: uniqueTimestamps.map((timestamp) => {
      const date = parseISO(timestamp);
      return format(date, "dd/MM", { locale: es });
    }),
    datasets: datasets.map((dataset) => {
      const sortedData = [...dataset.data].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return {
        label: dataset.label,
        data: uniqueTimestamps.map((timestamp) => {
          const point = sortedData.find((p) => p.timestamp === timestamp);
          return point ? point.value : null;
        }),
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        borderWidth: 3,
        pointBackgroundColor: dataset.color,
        pointBorderColor: dataset.color,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.4,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: datasets[0]?.color || "#6B7280",
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: {
            dataset: { label?: string };
            parsed: { y: number };
          }) => {
            return `${context.dataset.label || "Valor"}: ${
              context.parsed.y
            } ${unit}`;
          },
          title: (tooltipItems: { dataIndex: number }[]) => {
            const index = tooltipItems[0].dataIndex;
            const timestamp = uniqueTimestamps[index];
            const date = parseISO(timestamp);
            return format(date, "dd/MM/yyyy HH:mm", { locale: es });
          },
        },
      },
      datalabels: {
        display: true,
        align: "top" as const,
        anchor: "end" as const,
        color: "#374151",
        font: {
          weight: "bold" as const,
          size: 12,
        },
        formatter: function (value: number) {
          return value !== null ? value.toString() : "";
        },
        offset: 4,
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

  if (
    datasets.length === 0 ||
    datasets.every((dataset) => dataset.data.length === 0)
  ) {
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
          <p
            className="text-lg font-semibold"
            style={{ color: datasets[0]?.color }}
          >
            {datasets[0]?.data[datasets[0].data.length - 1]?.value || 0} {unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Promedio</p>
          <p
            className="text-lg font-semibold"
            style={{ color: datasets[0]?.color }}
          >
            {datasets[0]?.data.length
              ? Math.round(
                  datasets[0].data.reduce(
                    (sum: number, point: MeasurementPoint) => sum + point.value,
                    0
                  ) / datasets[0].data.length
                )
              : 0}{" "}
            {unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tendencia</p>
          <p
            className="text-lg font-semibold"
            style={{ color: datasets[0]?.color }}
          >
            {datasets[0]?.data.length >= 2
              ? datasets[0].data[datasets[0].data.length - 1].value >
                datasets[0].data[datasets[0].data.length - 2].value
                ? "↗️"
                : "↘️"
              : "➖"}
          </p>
        </div>
      </div>
    </div>
  );
};
