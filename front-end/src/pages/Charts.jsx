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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#D88484",
  "#32CD32",
];

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading charts...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
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
        month: `Month ${d.month}`,
        value: showPasses ? d.passes : d.revenue,
      }));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          className="px-4 py-2 border rounded"
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
          className="px-4 py-2 border rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button
          className={`px-4 py-2 rounded ${
            showPasses ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setShowPasses(true)}
        >
          Show Passes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            !showPasses ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setShowPasses(false)}
        >
          Show Revenue
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">
            Cross-Operator Transactions for{" "}
            {operators.find((op) => op.operatorid === selectedOperator)?.name}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={getPieChartData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {getPieChartData().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Total Transactions by Operator
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={getBarChartData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operator" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={showPasses ? "passes" : "revenue"} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Monthly Transactions for{" "}
            {operators.find((op) => op.operatorid === selectedOperator)?.name}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={getLineChartData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
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
      </div>
    </div>
  );
};

export default Charts;
