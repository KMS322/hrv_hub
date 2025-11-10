import "../../css/chart.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constants";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PPGChart = ({ data, dataKey, color, title }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h3>{title}</h3>
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          {/* <Tooltip />
          <Legend /> */}
          <Line type="monotone" dataKey={dataKey} stroke={color} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Chart = ({ fileName, close }) => {
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [minRange, setMinRange] = useState("");
  const [maxRange, setMaxRange] = useState("");

  useEffect(() => {
    const loadChart = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/master/loadChart`,
          { fileName },
          { responseType: "text" } // CSV는 텍스트로 받아야 함
        );

        const parsed = Papa.parse(response.data, { header: true });
        const processed = parsed.data.map((row, i) => ({
          index: i,
          ir: Number(row.ir),
          red: Number(row.red),
          // green: Number(row.green),
        }));
        setData(processed);
        setDisplayData(processed);
        setMinRange("1");
        setMaxRange(processed.length.toString());
        // console.log("CSV loaded & parsed:", processed);
      } catch (e) {
        console.error(e);
      }
    };

    if (fileName) loadChart();
  }, [fileName]);

  const handleApplyRange = () => {
    const min = parseInt(minRange);
    const max = parseInt(maxRange);

    if (isNaN(min) || isNaN(max) || min < 0 || max > data.length || min > max) {
      alert("유효한 범위를 입력하세요.");
      return;
    }
    console.log("cklick");
    setDisplayData(data.slice(min, max + 1));
  };

  const handleResetRange = () => {
    setDisplayData(data);
    setMinRange("");
    setMaxRange("");
  };

  return (
    <div className="chart_container">
      {data.length === 0 && <p>데이터 로드 중...</p>}

      {data.length > 0 && (
        <>
          <div className="range_box">
            <input
              type="number"
              placeholder="min"
              value={minRange}
              onChange={(e) => setMinRange(e.target.value)}
            />
            <input
              type="number"
              placeholder="max"
              value={maxRange}
              onChange={(e) => setMaxRange(e.target.value)}
            />
            <div className="btn" onClick={handleApplyRange}>
              보기
            </div>
            <div className="btn" onClick={handleResetRange}>
              초기화
            </div>
            <div className="btn" onClick={close}>
              닫기
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chart;
