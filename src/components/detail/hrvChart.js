import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { API_URL } from "../constants";

const HrvChart = ({ fileName, close }) => {
  const [rawData, setRawData] = useState([]);
  const [rrData, setRrData] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // ------------------------
  // 1. 데이터 로딩
  // ------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${API_URL}/hrv/downloadFile`, {
          fileName,
          type: "company",
        });
        const text = await response.data.text();
        const rows = text.split("\n").map((r) => r.split(","));
        const irSignal = rows
          .map((row) => parseInt(row[1]))
          .filter((v) => !isNaN(v));

        setRawData(irSignal);

        // HRV 계산 파이프라인 실행
        const peaks = detectPeaks(irSignal, 100);
        const rr = computeRR(peaks, 100);
        const hrv = computeHRV(rr);

        setRrData(rr.map((v, i) => ({ index: i + 1, rr: v })));
        setMetrics(hrv);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [fileName]);

  // ------------------------
  // 2. 피크 검출
  // ------------------------
  function detectPeaks(signal, fs = 100) {
    let peaks = [];
    let minDistance = Math.floor(fs * 0.4); // 최소 0.4초 간격 (150 BPM 이상 무시)
    let threshold = mean(signal) + 0.3 * std(signal);

    for (let i = 1; i < signal.length - 1; i++) {
      if (
        signal[i] > threshold &&
        signal[i] > signal[i - 1] &&
        signal[i] > signal[i + 1]
      ) {
        if (peaks.length === 0 || i - peaks[peaks.length - 1] > minDistance) {
          peaks.push(i);
        }
      }
    }
    return peaks;
  }

  // ------------------------
  // 3. RR interval 계산
  // ------------------------
  function computeRR(peaks, fs = 100) {
    let rr = [];
    for (let i = 1; i < peaks.length; i++) {
      let interval = (peaks[i] - peaks[i - 1]) * (1000 / fs); // ms 단위
      if (interval > 300 && interval < 2000) {
        rr.push(interval);
      }
    }
    return rr;
  }

  // ------------------------
  // 4. HRV 지표 계산
  // ------------------------
  function computeHRV(rr) {
    if (!rr || rr.length < 2) return null;
    const meanRR = mean(rr);
    const bpm = 60000 / meanRR;
    const sdnn = Math.sqrt(
      rr.map((x) => Math.pow(x - meanRR, 2)).reduce((a, b) => a + b, 0) /
        (rr.length - 1)
    );
    const diff = rr.slice(1).map((x, i) => x - rr[i]);
    const rmssd = Math.sqrt(
      diff.map((x) => x * x).reduce((a, b) => a + b, 0) / diff.length
    );

    return { meanRR, bpm, sdnn, rmssd };
  }

  // ------------------------
  // 5. 보조 함수
  // ------------------------
  function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  function std(arr) {
    const mu = mean(arr);
    return Math.sqrt(
      arr.map((x) => Math.pow(x - mu, 2)).reduce((a, b) => a + b, 0) /
        arr.length
    );
  }

  // ------------------------
  // 6. 렌더링
  // ------------------------
  return (
    <div className="hrv_container">
      <div className="metrics_box">
        {metrics ? (
          <>
            <p>평균 RR 간격: {metrics.meanRR.toFixed(2)} ms</p>
            <p>평균 심박수: {metrics.bpm.toFixed(2)} BPM</p>
            <p>SDNN: {metrics.sdnn.toFixed(2)} ms</p>
            <p>RMSSD: {metrics.rmssd.toFixed(2)} ms</p>
          </>
        ) : (
          <p>데이터 부족</p>
        )}
      </div>

      <h3>RR Interval 시계열</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rrData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            label={{ value: "순서", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis
            label={{ value: "RR (ms)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="rr" stroke="#ff0000" dot />
        </LineChart>
      </ResponsiveContainer>

      <button onClick={close} className="btn_close">
        닫기
      </button>
    </div>
  );
};

export default HrvChart;
