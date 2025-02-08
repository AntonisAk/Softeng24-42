import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { apiClient } from "../api/client";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./styles/Charts.module.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#32CD32",
  "#D88484",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatValue = (value, showPasses) => {
  if (!showPasses) {
    return `€${value.toLocaleString()}`;
  }
  return value.toLocaleString();
};

const Charts = () => {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [operators, setOperators] = useState([]);
  const [crossOpData, setCrossOpData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);

  // Filter states
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showPasses, setShowPasses] = useState(true);

  // Derived data
  const availableYears = [
    ...new Set([
      ...(crossOpData.map((d) => d.year) || []),
      ...(trafficData.map((d) => d.year) || []),
    ]),
  ].sort();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [operatorsData, trafficResult] = await Promise.all([
          apiClient.getOperators(auth.token),
          apiClient.getTrafficData(auth.token),
        ]);

        setOperators(operatorsData);
        setTrafficData(trafficResult);

        if (operatorsData.length > 0) {
          setSelectedOperator(operatorsData[0].operatorid);
        }

        if (trafficResult.length > 0) {
          setSelectedYear(trafficResult[0].year);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [auth.token]);

  useEffect(() => {
    const fetchCrossOpData = async () => {
      if (selectedOperator) {
        try {
          const data = await apiClient.getCrossOpData(
            auth.token,
            selectedOperator
          );
          setCrossOpData(data);
        } catch (err) {
          setError(err.message);
        }
      }
    };

    fetchCrossOpData();
  }, [selectedOperator, auth.token]);

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading charts...</div>
      </div>
    );

  if (error)
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorText}>Error: {error}</div>
      </div>
    );

  // Get pie chart data for selected year
  const getPieChartData = () => {
    const yearData =
      crossOpData.find((d) => d.year === selectedYear)?.data || [];
    return yearData.map((d) => ({
      name: d.operator,
      value: showPasses ? d.passes : d.revenue,
    }));
  };

  // Get bar chart data for selected year
  const getBarChartData = () => {
    const yearData =
      trafficData.find((d) => d.year === selectedYear)?.data || [];
    const aggregatedData = {};

    yearData.forEach((d) => {
      if (!aggregatedData[d.operator]) {
        aggregatedData[d.operator] = {
          operator: d.operator,
          passes: 0,
          revenue: 0,
        };
      }
      aggregatedData[d.operator].passes += d.passes;
      aggregatedData[d.operator].revenue += d.revenue;
    });

    return Object.values(aggregatedData);
  };

  // Get line chart data for selected operator and year
  const getLineChartData = () => {
    const yearData =
      trafficData.find((d) => d.year === selectedYear)?.data || [];
    return yearData
      .filter((d) => d.opid === selectedOperator)
      .sort((a, b) => a.month - b.month)
      .map((d) => ({
        month: `${MONTHS[d.month - 1]}`,
        value: showPasses ? d.passes : d.revenue,
      }));
  };

  return (
    <div className={styles.container}>
      {/* Controls */}
      <div className={styles.controls}>
        <select
          className={styles.select}
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
        >
          {operators.map((op) => (
            <option key={op.operatorid} value={op.operatorid}>
              {op.name}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <div className={styles.toggleContainer}>
          <span
            className={`${styles.toggleLabel} ${
              !showPasses ? styles.active : ""
            }`}
          >
            Revenue
          </span>
          <button
            className={styles.toggle}
            onClick={() => setShowPasses(!showPasses)}
            role="switch"
            aria-checked={showPasses}
          >
            <span
              className={`${styles.toggleSlider} ${
                showPasses ? styles.checked : ""
              }`}
            />
          </button>
          <span
            className={`${styles.toggleLabel} ${
              showPasses ? styles.active : ""
            }`}
          >
            Passes
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsContainer}>
        {/* Pie Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            Cross-Operator Transactions for{" "}
            {operators.find((op) => op.operatorid === selectedOperator)?.name}
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={getPieChartData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={({ value }) => formatValue(value, showPasses)}
              >
                {getPieChartData().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatValue(value, showPasses)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>
            Monthly Transactions for{" "}
            {operators.find((op) => op.operatorid === selectedOperator)?.name}
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart
              data={getLineChartData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => formatValue(value, showPasses)}
              />
              <Tooltip formatter={(value) => formatValue(value, showPasses)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={showPasses ? "Passes" : "Revenue"}
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Total Transactions by Operator</h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={getBarChartData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operator" />
              <YAxis
                tickFormatter={(value) => formatValue(value, showPasses)}
              />
              <Tooltip formatter={(value) => formatValue(value, showPasses)} />
              <Legend />
              <Bar dataKey={showPasses ? "passes" : "revenue"} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
