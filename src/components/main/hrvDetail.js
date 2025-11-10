import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicHrvMetrics from "./hrv/BasicHrvMetrics";
import FrequencyDomainAnalysis from "./hrv/FrequencyDomainAnalysis";
import PoincareMetrics from "./hrv/PoincareMetrics";
import ComplexityAnalysis from "./hrv/ComplexityAnalysis";
import StressAnalysis from "./hrv/StressAnalysis";
import RrIntervalChart from "./hrv/RrIntervalChart";
import PoincarePlot from "./hrv/PoincarePlot";

const HrvDetail = ({ irData }) => {
  const [hrvData, setHrvData] = useState([]);
  const [poincareData, setPoincareData] = useState([]);
  const [hrvMetrics, setHrvMetrics] = useState(null);
  const navigate = useNavigate();

  // HRV 계산 함수들
  const detectPeaks = (signal, fs = 100) => {
    let peaks = [];
    let minDistance = Math.floor(fs * 0.4); // 최소 0.4초 간격 (150 BPM 이상 무시)
    
    // 더 정교한 임계값 계산
    const signalMean = mean(signal);
    const signalStd = std(signal);
    let threshold = signalMean + 0.5 * signalStd; // 임계값을 높여서 노이즈 제거
    
    console.log("신호 통계:", {
      mean: signalMean.toFixed(2),
      std: signalStd.toFixed(2),
      threshold: threshold.toFixed(2),
      min: Math.min(...signal).toFixed(2),
      max: Math.max(...signal).toFixed(2)
    });

    // 슬라이딩 윈도우로 피크 검출
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
    
    // 피크가 너무 적으면 임계값을 낮춰서 재시도
    if (peaks.length < 10) {
      console.log("피크가 너무 적음, 임계값을 낮춰서 재시도");
      threshold = signalMean + 0.2 * signalStd;
      peaks = [];
      
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
    }
    
    return peaks;
  };

  const computeRR = (peaks, fs = 100) => {
    let rr = [];
    for (let i = 1; i < peaks.length; i++) {
      let interval = (peaks[i] - peaks[i - 1]) * (1000 / fs); // ms 단위
      // 더 넓은 범위로 필터링 (30-200 BPM에 해당)
      if (interval > 300 && interval < 2000) {
        rr.push(interval);
      }
    }
    
    // RR 간격이 너무 적으면 더 관대한 필터링 적용
    if (rr.length < 5) {
      console.log("RR 간격이 너무 적음, 더 관대한 필터링 적용");
      rr = [];
      for (let i = 1; i < peaks.length; i++) {
        let interval = (peaks[i] - peaks[i - 1]) * (1000 / fs);
        if (interval > 200 && interval < 3000) { // 더 넓은 범위
          rr.push(interval);
        }
      }
    }
    
    return rr;
  };

  const computeHRV = (rr) => {
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

    // pNN50 계산
    const pnn50 = (diff.filter(d => Math.abs(d) > 50).length / diff.length) * 100;

    // 주파수 도메인 분석 (LF, HF, LF/HF)
    const { lf, hf, lfHfRatio } = computeFrequencyDomain(rr);

    // Poincare plot 지표
    const { sd1, sd2, ellipseArea } = computePoincare(rr);

    // Entropy 계산
    const sampleEntropy = computeSampleEntropy(rr);

    return { 
      meanRR, 
      bpm, 
      sdnn, 
      rmssd, 
      pnn50, 
      lf, 
      hf, 
      lfHfRatio,
      sd1,
      sd2,
      ellipseArea,
      sampleEntropy
    };
  };

  const mean = (arr) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const std = (arr) => {
    const mu = mean(arr);
    return Math.sqrt(
      arr.map((x) => Math.pow(x - mu, 2)).reduce((a, b) => a + b, 0) /
        arr.length
    );
  };

  // 주파수 도메인 분석 (LF, HF, LF/HF)
  const computeFrequencyDomain = (rr) => {
    if (rr.length < 10) return { lf: 0, hf: 0, lfHfRatio: 0 };
    
    // RR 간격을 균등한 시간 간격으로 리샘플링
    const fs = 4; // 4Hz로 리샘플링
    const duration = rr.reduce((sum, interval) => sum + interval, 0) / 1000; // 초 단위
    const timePoints = Math.floor(duration * fs);
    const resampledRR = new Array(timePoints).fill(0);
    
    let currentTime = 0;
    let rrIndex = 0;
    
    for (let i = 0; i < timePoints; i++) {
      const targetTime = i / fs;
      while (rrIndex < rr.length && currentTime < targetTime) {
        currentTime += rr[rrIndex] / 1000;
        rrIndex++;
      }
      if (rrIndex > 0) {
        resampledRR[i] = rr[rrIndex - 1];
      }
    }
    
    // FFT를 사용한 주파수 분석 (간단한 구현)
    const fft = simpleFFT(resampledRR);
    const freqs = fft.map((_, i) => i * fs / resampledRR.length);
    
    // LF (0.04-0.15 Hz)와 HF (0.15-0.4 Hz) 파워 계산
    const lfPower = freqs
      .map((freq, i) => freq >= 0.04 && freq <= 0.15 ? Math.abs(fft[i]) ** 2 : 0)
      .reduce((sum, power) => sum + power, 0);
    
    const hfPower = freqs
      .map((freq, i) => freq >= 0.15 && freq <= 0.4 ? Math.abs(fft[i]) ** 2 : 0)
      .reduce((sum, power) => sum + power, 0);
    
    const lfHfRatio = hfPower > 0 ? lfPower / hfPower : 0;
    
    return { lf: lfPower, hf: hfPower, lfHfRatio };
  };

  // 간단한 FFT 구현
  const simpleFFT = (signal) => {
    const N = signal.length;
    const fft = new Array(N).fill(0).map(() => ({ real: 0, imag: 0 }));
    
    for (let k = 0; k < N; k++) {
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        fft[k].real += signal[n] * Math.cos(angle);
        fft[k].imag += signal[n] * Math.sin(angle);
      }
    }
    
    return fft.map(complex => Math.sqrt(complex.real ** 2 + complex.imag ** 2));
  };

  // Poincare plot 지표 계산
  const computePoincare = (rr) => {
    if (rr.length < 2) return { sd1: 0, sd2: 0, ellipseArea: 0 };
    
    const rr1 = rr.slice(0, -1);
    const rr2 = rr.slice(1);
    
    const diff = rr2.map((r2, i) => r2 - rr1[i]);
    const sum = rr2.map((r2, i) => r2 + rr1[i]);
    
    const sd1 = std(diff) / Math.sqrt(2);
    const sd2 = std(sum) / Math.sqrt(2);
    const ellipseArea = Math.PI * sd1 * sd2;
    
    return { sd1, sd2, ellipseArea };
  };

  // Sample Entropy 계산
  const computeSampleEntropy = (rr, m = 2, r = 0.2) => {
    if (rr.length < m + 1) return 0;
    
    const N = rr.length;
    const stdRR = std(rr);
    const tolerance = r * stdRR;
    
    const countMatches = (m) => {
      let matches = 0;
      for (let i = 0; i < N - m; i++) {
        for (let j = i + 1; j < N - m; j++) {
          let match = true;
          for (let k = 0; k < m; k++) {
            if (Math.abs(rr[i + k] - rr[j + k]) > tolerance) {
              match = false;
              break;
            }
          }
          if (match) matches++;
        }
      }
      return matches;
    };
    
    const phiM = countMatches(m);
    const phiM1 = countMatches(m + 1);
    
    if (phiM === 0) return 0;
    
    return -Math.log(phiM1 / phiM);
  };

  // IR 데이터가 변경될 때마다 HRV 계산
  React.useEffect(() => {
    if (irData && irData.length > 0) {
      const irSignal = irData.map(d => d.ir);
      console.log("HRV 계산 시작 - IR 신호 길이:", irSignal.length);
      
      const peaks = detectPeaks(irSignal, 100);
      console.log("검출된 피크 개수:", peaks.length);
      console.log("피크 샘플:", peaks.slice(0, 10));
      
      const rr = computeRR(peaks, 100);
      console.log("RR 간격 개수:", rr.length);
      console.log("RR 간격 샘플:", rr.slice(0, 10));
      console.log("RR 간격 범위:", Math.min(...rr), "-", Math.max(...rr));
      
      const hrv = computeHRV(rr);
      console.log("HRV 지표:", hrv);
      
      // 심박수 검증
      const calculatedBpm = 60000 / (rr.reduce((sum, interval) => sum + interval, 0) / rr.length);
      console.log("계산된 평균 심박수:", calculatedBpm.toFixed(2), "BPM");
      
      setHrvData(rr.map((v, i) => ({ index: i + 1, rr: v })));
      setHrvMetrics(hrv);
      
      // Poincare plot 데이터 생성
      const poincarePoints = rr.slice(0, -1).map((rr1, i) => ({
        x: rr1,
        y: rr[i + 1]
      }));
      setPoincareData(poincarePoints);
    }
  }, [irData]);

  if (!irData || irData.length === 0) {
    return null;
  }

  return (
    <div className="hrv-section">
      <h2>HRV (심박변이도) 분석</h2>
      
      <RrIntervalChart hrvData={hrvData} />
      <BasicHrvMetrics metrics={hrvMetrics} />
      <FrequencyDomainAnalysis metrics={hrvMetrics} />
      <PoincareMetrics metrics={hrvMetrics} />
      <ComplexityAnalysis metrics={hrvMetrics} />
      <StressAnalysis metrics={hrvMetrics} hrvData={hrvData} />
      <PoincarePlot poincareData={poincareData} />
      
      <div className="guide-button-container">
        <button 
          className="guide-button"
          onClick={() => navigate('/hrv-guide')}
        >
          📊 지표 계산법
        </button>
      </div>
    </div>
  );
};

export default HrvDetail;
