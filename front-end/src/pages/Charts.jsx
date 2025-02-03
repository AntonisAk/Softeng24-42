import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import styles from "./styles/Charts.module.css";

function Charts() {
  const { auth } = useContext(AuthContext);
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dataType, setDataType] = useState("passes"); // "passes" or "revenue"
  const [crossOpData, setCrossOpData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [years, setYears] = useState([]);

  // Fetch operators
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch("https://localhost:9115/api/operators", {
          headers: {
            "X-OBSERVATORY-AUTH": auth.token,
          },
        });
        const data = await response.json();
        setOperators(data);
        if (data.length > 0) setSelectedOperator(data[0].operatorid);
      } catch (error) {
        console.error("Error fetching operators:", error);
      }
    };
    fetchOperators();
  }, [auth.token]);

  // Fetch cross-operator data
  useEffect(() => {
    if (!selectedOperator || !selectedYear) return;
    const fetchCrossOpData = async () => {
      try {
        const response = await fetch(
          `https://localhost:9115/api/crossop/${selectedOperator}`,
          {
            headers: {
              "X-OBSERVATORY-AUTH": auth.token,
            },
          }
        );
        const data = await response.json();
        const yearData = data.find((item) => item.year === selectedYear);
        setCrossOpData(yearData ? yearData.data : []);
      } catch (error) {
        console.error("Error fetching cross-operator data:", error);
      }
    };
    fetchCrossOpData();
  }, [auth.token, selectedOperator, selectedYear]);

  // Fetch traffic data
  useEffect(() => {
    if (!selectedYear) return;
    const fetchTrafficData = async () => {
      try {
        const response = await fetch("https://localhost:9115/api/traffic", {
          headers: {
            "X-OBSERVATORY-AUTH": auth.token,
          },
        });
        const data = await response.json();
        const yearData = data.find((item) => item.year === selectedYear);
        setTrafficData(yearData ? yearData.data : []);
        // Extract unique years for dropdown
        const uniqueYears = [...new Set(data.map((item) => item.year))];
        setYears(uniqueYears);
        if (uniqueYears.length > 0 && !selectedYear)
          setSelectedYear(uniqueYears[0]);
      } catch (error) {
        console.error("Error fetching traffic data:", error);
      }
    };
    fetchTrafficData();
  }, [auth.token, selectedYear]);

  // Prepare data for charts
  const pieChartData = crossOpData.map((item) => ({
    name: item.operator,
    value: item[dataType],
  }));

  const barChartData = Object.values(
    trafficData.reduce((acc, item) => {
      if (!acc[item.opid]) {
        acc[item.opid] = { operator: item.operator, passes: 0, revenue: 0 };
      }
      acc[item.opid].passes += item.passes;
      acc[item.opid].revenue += item.revenue;
      return acc;
    }, {})
  );

  const lineChartData = Array.from({ length: 12 }, (_, i) => {
    const monthData = trafficData.filter(
      (item) => item.month === i + 1 && item.opid === selectedOperator
    );
    return {
      month: i + 1,
      passes: monthData.reduce((sum, item) => sum + item.passes, 0),
      revenue: monthData.reduce((sum, item) => sum + item.revenue, 0),
    };
  });

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className={styles.chartsPage}>
      <h1>Charts</h1>
      <div className={styles.filters}>
        <label>
          Operator:
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
          >
            {operators.map((op) => (
              <option key={op.operatorid} value={op.operatorid}>
                {op.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year:
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data Type:
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
          >
            <option value="passes">Passes</option>
            <option value="revenue">Revenue</option>
          </select>
        </label>
      </div>

      <div className={styles.chartContainer}>
        <h2>Cross-Operator Pass Transactions</h2>
        <PieChart width={400} height={400}>
          <Pie
            data={pieChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {pieChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <div className={styles.chartContainer}>
        <h2>All Pass Transactions Through Operators</h2>
        <BarChart width={600} height={400} data={barChartData}>
          <XAxis dataKey="operator" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataType} fill="#8884d8" />
        </BarChart>
      </div>

      <div className={styles.chartContainer}>
        <h2>Monthly Pass Transactions Through Operator</h2>
        <LineChart width={600} height={400} data={lineChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataType} stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
}

export default Charts;
