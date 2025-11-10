import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../../css/hrv.css";
import HrvDetail from "./hrvDetail";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../constants";

const Hrv = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [irData, setIrData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 서버에서 파일 다운로드 및 처리 함수
  const downloadAndProcessFile = async (fileName) => {
    try {
      setIsLoading(true);
      setFileName(fileName);

      const response = await axios.post(
        `${API_URL}/hrv/downloadFile`,
        { fileName, type: "company" },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Blob을 텍스트로 변환
      const text = await new Response(response.data).text();
      const rows = text.split("\n").filter((row) => row.trim() !== "");

      console.log("서버에서 다운로드된 CSV 파일 내용 샘플:", rows.slice(0, 5));
      console.log("총 행 수:", rows.length);

      // 헤더 확인
      if (rows.length > 0) {
        const header = rows[0].split(",");
        console.log("CSV 헤더:", header);
        console.log("헤더 개수:", header.length);
      }

      // CSV 파싱 (time, cnt, ir, red, green, spo2, hr, temp 컬럼)
      const parsedData = rows.map((row, index) => {
        const columns = row.split(",");

        // 유효성 검사 함수
        const safeParseInt = (value, defaultValue = null) => {
          const parsed = parseInt(value);
          return !isNaN(parsed) && parsed !== null && parsed !== undefined
            ? parsed
            : defaultValue;
        };

        const safeParseFloat = (value, defaultValue = null) => {
          const parsed = parseFloat(value);
          return !isNaN(parsed) && parsed !== null && parsed !== undefined
            ? parsed
            : defaultValue;
        };

        return {
          index: index + 1,
          time: columns[0]?.trim() || "",
          cnt: safeParseInt(columns[1], null),
          ir: safeParseInt(columns[2], null),
          red: safeParseInt(columns[3], null),
          green: safeParseInt(columns[4], null),
          spo2: safeParseFloat(columns[5], null),
          hr: safeParseInt(columns[6], null),
          temp: safeParseFloat(columns[7], null),
        };
      });

      console.log("파싱된 원본 데이터 샘플:", parsedData.slice(0, 5));
      console.log(
        "심박수 컬럼 샘플:",
        parsedData.slice(0, 5).map((d) => d.hr)
      );
      console.log(
        "SpO2 컬럼 샘플:",
        parsedData.slice(0, 5).map((d) => d.spo2)
      );

      // IR 데이터만 추출하여 차트용 데이터 생성 (유효한 IR 데이터만, 0 초과)
      const chartData = parsedData
        .filter(
          (item) =>
            item.ir !== null &&
            item.ir !== undefined &&
            !isNaN(item.ir) &&
            item.ir > 0
        )
        .map((item, index) => ({
          index: index + 1,
          ir: item.ir,
          time: item.time,
          cnt: item.cnt,
          red: item.red,
          green: item.green,
          spo2: item.spo2,
          hr: item.hr,
          temp: item.temp,
        }));

      console.log("파싱된 데이터:", chartData.slice(0, 10)); // 처음 10개 데이터 확인
      console.log("전체 데이터 개수:", chartData.length);
      console.log(
        "심박수 데이터 샘플:",
        chartData
          .slice(0, 5)
          .map((d) => ({ hr: d.hr, spo2: d.spo2, temp: d.temp }))
      );
      console.log(
        "유효한 심박수 개수:",
        chartData.filter((d) => d.hr !== null && d.hr !== undefined && d.hr > 0)
          .length
      );
      console.log(
        "유효한 SpO2 개수:",
        chartData.filter(
          (d) => d.spo2 !== null && d.spo2 !== undefined && d.spo2 > 0
        ).length
      );
      console.log(
        "유효한 온도 개수:",
        chartData.filter(
          (d) => d.temp !== null && d.temp !== undefined && d.temp > 0
        ).length
      );

      // 유효한 데이터 샘플 확인
      const validHrData = chartData.filter(
        (d) => d.hr !== null && d.hr !== undefined && d.hr > 0
      );
      const validSpo2Data = chartData.filter(
        (d) => d.spo2 !== null && d.spo2 !== undefined && d.spo2 > 0
      );
      const validTempData = chartData.filter(
        (d) => d.temp !== null && d.temp !== undefined && d.temp > 0
      );

      console.log(
        "유효한 심박수 샘플:",
        validHrData.slice(0, 5).map((d) => d.hr)
      );
      console.log(
        "유효한 SpO2 샘플:",
        validSpo2Data.slice(0, 5).map((d) => d.spo2)
      );
      console.log(
        "유효한 온도 샘플:",
        validTempData.slice(0, 5).map((d) => d.temp)
      );

      setIrData(chartData);
      setIsLoading(false);
    } catch (error) {
      console.error("파일 다운로드 및 처리 에러:", error);
      alert("파일을 다운로드하는 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  // URL 파라미터에서 파일명을 가져와서 자동으로 처리
  useEffect(() => {
    const fileNameParam = searchParams.get("fileName");
    if (fileNameParam) {
      downloadAndProcessFile(fileNameParam);
    }
  }, [searchParams]);

  // CSV 파일 처리 함수
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split("\n").filter((row) => row.trim() !== "");

        console.log("CSV 파일 내용 샘플:", rows.slice(0, 5));
        console.log("총 행 수:", rows.length);

        // 헤더 확인
        if (rows.length > 0) {
          const header = rows[0].split(",");
          console.log("CSV 헤더:", header);
          console.log("헤더 개수:", header.length);
        }

        // CSV 파싱 (time, cnt, ir, red, green, spo2, hr, temp 컬럼)
        const parsedData = rows.map((row, index) => {
          const columns = row.split(",");

          // 유효성 검사 함수
          const safeParseInt = (value, defaultValue = null) => {
            const parsed = parseInt(value);
            return !isNaN(parsed) && parsed !== null && parsed !== undefined
              ? parsed
              : defaultValue;
          };

          const safeParseFloat = (value, defaultValue = null) => {
            const parsed = parseFloat(value);
            return !isNaN(parsed) && parsed !== null && parsed !== undefined
              ? parsed
              : defaultValue;
          };

          return {
            index: index + 1,
            time: columns[0]?.trim() || "",
            cnt: safeParseInt(columns[1], null),
            ir: safeParseInt(columns[2], null),
            red: safeParseInt(columns[3], null),
            green: safeParseInt(columns[4], null),
            spo2: safeParseFloat(columns[5], null),
            hr: safeParseInt(columns[6], null),
            temp: safeParseFloat(columns[7], null),
          };
        });

        console.log("파싱된 원본 데이터 샘플:", parsedData.slice(0, 5));
        console.log(
          "심박수 컬럼 샘플:",
          parsedData.slice(0, 5).map((d) => d.hr)
        );
        console.log(
          "SpO2 컬럼 샘플:",
          parsedData.slice(0, 5).map((d) => d.spo2)
        );

        // IR 데이터만 추출하여 차트용 데이터 생성 (유효한 IR 데이터만, 0 초과)
        const chartData = parsedData
          .filter(
            (item) =>
              item.ir !== null &&
              item.ir !== undefined &&
              !isNaN(item.ir) &&
              item.ir > 0
          )
          .map((item, index) => ({
            index: index + 1,
            ir: item.ir,
            time: item.time,
            cnt: item.cnt,
            red: item.red,
            green: item.green,
            spo2: item.spo2,
            hr: item.hr,
            temp: item.temp,
          }));

        console.log("파싱된 데이터:", chartData.slice(0, 10)); // 처음 10개 데이터 확인
        console.log("전체 데이터 개수:", chartData.length);
        console.log(
          "심박수 데이터 샘플:",
          chartData
            .slice(0, 5)
            .map((d) => ({ hr: d.hr, spo2: d.spo2, temp: d.temp }))
        );
        console.log(
          "유효한 심박수 개수:",
          chartData.filter(
            (d) => d.hr !== null && d.hr !== undefined && d.hr > 0
          ).length
        );
        console.log(
          "유효한 SpO2 개수:",
          chartData.filter(
            (d) => d.spo2 !== null && d.spo2 !== undefined && d.spo2 > 0
          ).length
        );
        console.log(
          "유효한 온도 개수:",
          chartData.filter(
            (d) => d.temp !== null && d.temp !== undefined && d.temp > 0
          ).length
        );

        // 유효한 데이터 샘플 확인
        const validHrData = chartData.filter(
          (d) => d.hr !== null && d.hr !== undefined && d.hr > 0
        );
        const validSpo2Data = chartData.filter(
          (d) => d.spo2 !== null && d.spo2 !== undefined && d.spo2 > 0
        );
        const validTempData = chartData.filter(
          (d) => d.temp !== null && d.temp !== undefined && d.temp > 0
        );

        console.log(
          "유효한 심박수 샘플:",
          validHrData.slice(0, 5).map((d) => d.hr)
        );
        console.log(
          "유효한 SpO2 샘플:",
          validSpo2Data.slice(0, 5).map((d) => d.spo2)
        );
        console.log(
          "유효한 온도 샘플:",
          validTempData.slice(0, 5).map((d) => d.temp)
        );

        setIrData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.error("파일 파싱 에러:", error);
        alert("파일을 읽는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="test-container">
      <h1>HRV 지표 분석</h1>
      <div className="btn_box">
        <button className="guide-btn" onClick={() => navigate("/hrv-guide")}>
          가이드
        </button>
      </div>

      {!searchParams.get("fileName") && (
        <div className="upload-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csv-upload"
            style={{ display: "none" }}
          />
          <label htmlFor="csv-upload" className="upload-button">
            {isLoading ? "처리 중..." : "CSV 파일 선택"}
          </label>
          {fileName && <p className="file-name">선택된 파일: {fileName}</p>}
        </div>
      )}

      {searchParams.get("fileName") && (
        <div className="upload-section">
          <p className="file-name">분석 중인 파일: {fileName}</p>
          {isLoading && <p className="loading-text">처리 중...</p>}
        </div>
      )}

      {irData.length > 0 && (
        <div className="chart-section">
          <h2>센서 데이터 분석</h2>
          <div className="data-info">
            <p>총 {irData.length}개의 유효한 IR 데이터 포인트</p>
            <div className="data-stats">
              <div className="stat-item">
                <strong>IR 유효 데이터:</strong>{" "}
                {
                  irData.filter(
                    (d) => d.ir !== null && d.ir !== undefined && d.ir > 0
                  ).length
                }
                개
              </div>
              <div className="stat-item">
                <strong>심박수 유효 데이터:</strong>{" "}
                {
                  irData.filter(
                    (d) => d.hr !== null && d.hr !== undefined && d.hr > 0
                  ).length
                }
                개
              </div>
              <div className="stat-item">
                <strong>SpO2 유효 데이터:</strong>{" "}
                {
                  irData.filter(
                    (d) => d.spo2 !== null && d.spo2 !== undefined && d.spo2 > 0
                  ).length
                }
                개
              </div>
              <div className="stat-item">
                <strong>온도 유효 데이터:</strong>{" "}
                {
                  irData.filter(
                    (d) => d.temp !== null && d.temp !== undefined && d.temp > 0
                  ).length
                }
                개
              </div>
            </div>
            <div className="data-summary">
              <div className="summary-item">
                <strong>IR 범위:</strong>{" "}
                {(() => {
                  const validIrData = irData.filter(
                    (d) =>
                      d.ir !== undefined &&
                      d.ir !== null &&
                      !isNaN(d.ir) &&
                      d.ir > 0
                  );
                  return validIrData.length > 0
                    ? `${Math.min(
                        ...validIrData.map((d) => d.ir)
                      )} - ${Math.max(...validIrData.map((d) => d.ir))}`
                    : "유효한 데이터 없음";
                })()}
              </div>
              <div className="summary-item">
                <strong>평균 심박수:</strong>{" "}
                {(() => {
                  const validHrData = irData.filter(
                    (d) =>
                      d.hr !== undefined &&
                      d.hr !== null &&
                      !isNaN(d.hr) &&
                      d.hr > 0
                  );
                  return validHrData.length > 0
                    ? `${Math.round(
                        validHrData.reduce((sum, d) => sum + d.hr, 0) /
                          validHrData.length
                      )} BPM (${validHrData.length}개 유효 데이터)`
                    : "유효한 데이터 없음";
                })()}
              </div>
              <div className="summary-item">
                <strong>평균 SpO2:</strong>{" "}
                {(() => {
                  const validSpo2Data = irData.filter(
                    (d) =>
                      d.spo2 !== undefined &&
                      d.spo2 !== null &&
                      !isNaN(d.spo2) &&
                      d.spo2 > 0
                  );
                  return validSpo2Data.length > 0
                    ? `${(
                        validSpo2Data.reduce((sum, d) => sum + d.spo2, 0) /
                        validSpo2Data.length
                      ).toFixed(1)}% (${validSpo2Data.length}개 유효 데이터)`
                    : "유효한 데이터 없음";
                })()}
              </div>
              <div className="summary-item">
                <strong>평균 온도:</strong>{" "}
                {(() => {
                  const validTempData = irData.filter(
                    (d) =>
                      d.temp !== undefined &&
                      d.temp !== null &&
                      !isNaN(d.temp) &&
                      d.temp > 0
                  );
                  return validTempData.length > 0
                    ? `${(
                        validTempData.reduce((sum, d) => sum + d.temp, 0) /
                        validTempData.length
                      ).toFixed(1)}°C (${validTempData.length}개 유효 데이터)`
                    : "유효한 데이터 없음";
                })()}
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h3>IR 센서 데이터</h3>
            <ResponsiveContainer width="100%" height={600}>
              <LineChart data={irData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="index"
                  label={{
                    value: "데이터 포인트",
                    position: "insideBottomRight",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{ value: "IR 값", angle: -90, position: "insideLeft" }}
                  domain={["dataMin", "dataMax"]}
                />
                <Tooltip
                  formatter={(value, name) => [value, "IR"]}
                  labelFormatter={(label) => `포인트: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="ir"
                  stroke="#ff6b6b"
                  strokeWidth={1}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <HrvDetail irData={irData} />

      {irData.length === 0 && !isLoading && !searchParams.get("fileName") && (
        <div className="no-data">
          <p>CSV 파일을 업로드하여 IR 데이터를 분석해보세요.</p>
        </div>
      )}

      {irData.length === 0 && !isLoading && searchParams.get("fileName") && (
        <div className="no-data">
          <p>파일을 처리하는 중 오류가 발생했습니다.</p>
        </div>
      )}
    </div>
  );
};

export default Hrv;
