import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function AssetChart() {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [totalRes, cashRes] = await Promise.all([
          fetch("/tradeStrategyPortfolioValue.json"),
          fetch("/tradeStrategyCashLogs.json"),
        ]);

        if (!totalRes.ok || !cashRes.ok) {
          throw new Error("Failed to load one or both JSON files.");
        }

        const [totalData, cashData] = await Promise.all([
          totalRes.json(),
          cashRes.json(),
        ]);

        const totalMap = {};
        totalData.forEach((entry) => {
          const date = new Date(entry.timestamp).toISOString().split("T")[0];
          totalMap[date] = entry.totalValue; // same here if needed
        });

        const cashMap = {};
        cashData.forEach((entry) => {
          const date = new Date(entry.timestamp).toISOString().split("T")[0];
          cashMap[date] = entry.cash; // overwrite instead of summing
        });

        const allDates = Array.from(
          new Set([...Object.keys(totalMap), ...Object.keys(cashMap)]),
        );
        allDates.sort(); // lexicographic sort is safe here due to YYYY-MM-DD format

        const labels = [];
        const values = [];

        allDates.forEach((date) => {
          const total = (totalMap[date] || 0) + (cashMap[date] || 0);
          labels.push(date);
          values.push(total);
        });

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Asset Over Time",
              data: values,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.3,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 6,
            },
          ],
        });
      } catch (err) {
        console.error("AssetChart error:", err);
        setError("Failed to load chart data.");
      }
    }

    fetchData();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div>
      <h2>Total Asset Over Time</h2>
      <Line
        data={chartData}
        options={{
          responsive: false,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: "Total Portfolio Value (Cash + Holdings)",
            },
          },
          scales: {
            x: {
              type: "time",
              time: { unit: "day" },
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: "USD Value",
              },
            },
          },
        }}
      />
    </div>
  );
}
