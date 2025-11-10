import React from "react";
import { useNavigate } from "react-router-dom";

const HrvCalculationGuide = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="calculation-guide">
      <div className="guide-header">
        <button onClick={goBack} className="back-button">
          ← 뒤로가기
        </button>
        <h1>HRV 지표 계산법 가이드</h1>
      </div>

      <div className="guide-content">
        <section className="guide-section">
          <h2>1. 기본 HRV 지표</h2>
          
          <div className="metric-explanation">
            <h3>SDNN (Standard Deviation of NN intervals)</h3>
            <p><strong>의미:</strong> RR 간격의 표준편차로 전체적인 심박변이도를 나타냅니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              SDNN = √(Σ(RR<sub>i</sub> - RR<sub>mean</sub>)² / (N-1))
            </div>
            <p>여기서 RR<sub>i</sub>는 각 RR 간격, RR<sub>mean</sub>은 평균 RR 간격, N은 총 RR 간격 개수입니다.</p>
            <p><strong>해석:</strong> 높을수록 심박변이도가 크고 건강한 상태를 의미합니다.</p>
          </div>

          <div className="metric-explanation">
            <h3>RMSSD (Root Mean Square of Successive Differences)</h3>
            <p><strong>의미:</strong> 연속된 RR 간격 차이의 제곱근 평균으로 부교감신경계 활성도를 나타냅니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              RMSSD = √(Σ(RR<sub>i+1</sub> - RR<sub>i</sub>)² / (N-1))
            </div>
            <p><strong>해석:</strong> 높을수록 부교감신경계가 활발하고 이완 상태가 좋음을 의미합니다.</p>
          </div>

          <div className="metric-explanation">
            <h3>pNN50 (Percentage of NN50)</h3>
            <p><strong>의미:</strong> 50ms 이상 차이나는 연속 RR 간격의 비율입니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              pNN50 = (NN50 개수 / 총 RR 간격 개수) × 100
            </div>
            <p>여기서 NN50은 |RR<sub>i+1</sub> - RR<sub>i</sub>| > 50ms인 경우의 개수입니다.</p>
            <p><strong>해석:</strong> 높을수록 부교감신경계 활성도가 높고 회복력이 좋음을 의미합니다.</p>
          </div>
        </section>

        <section className="guide-section">
          <h2>2. 주파수 도메인 분석</h2>
          
          <div className="metric-explanation">
            <h3>LF Power (Low Frequency Power)</h3>
            <p><strong>의미:</strong> 0.04-0.15 Hz 대역의 파워로 교감신경계와 부교감신경계의 복합적 활성도를 나타냅니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              LF Power = Σ|FFT(f)|² (0.04 ≤ f ≤ 0.15 Hz)
            </div>
            <p>FFT(Fast Fourier Transform)를 사용하여 주파수 도메인으로 변환 후 해당 대역의 파워를 계산합니다.</p>
          </div>

          <div className="metric-explanation">
            <h3>HF Power (High Frequency Power)</h3>
            <p><strong>의미:</strong> 0.15-0.4 Hz 대역의 파워로 부교감신경계(미주신경)의 활성도를 나타냅니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              HF Power = Σ|FFT(f)|² (0.15 ≤ f ≤ 0.4 Hz)
            </div>
            <p><strong>해석:</strong> 높을수록 부교감신경계가 활발하고 이완 상태가 좋음을 의미합니다.</p>
          </div>

          <div className="metric-explanation">
            <h3>LF/HF Ratio</h3>
            <p><strong>의미:</strong> LF와 HF의 비율로 자율신경계 균형을 나타냅니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              LF/HF Ratio = LF Power / HF Power
            </div>
            <p><strong>해석:</strong> 1에 가까울수록 균형이 좋고, 높을수록 교감신경계가 우세함을 의미합니다.</p>
          </div>
        </section>

        <section className="guide-section">
          <h2>3. Poincare Plot 지표</h2>
          
          <div className="metric-explanation">
            <h3>SD1 (Short-term Variability)</h3>
            <p><strong>의미:</strong> Poincare plot에서 단기 변이성을 나타내며 부교감신경계의 활성도를 반영합니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              SD1 = SD(ΔRR) / √2
            </div>
            <p>여기서 ΔRR = RR<sub>i+1</sub> - RR<sub>i</sub> (연속된 RR 간격의 차이)</p>
          </div>

          <div className="metric-explanation">
            <h3>SD2 (Long-term Variability)</h3>
            <p><strong>의미:</strong> 장기 변이성을 나타내며 교감신경계와 부교감신경계의 복합적 활성도를 반영합니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              SD2 = SD(RR<sub>i</sub> + RR<sub>i+1</sub>) / √2
            </div>
          </div>

          <div className="metric-explanation">
            <h3>Ellipse Area</h3>
            <p><strong>의미:</strong> Poincare 타원의 면적으로 전체적인 심박변이도의 크기를 나타냅니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              Ellipse Area = π × SD1 × SD2
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>4. 복잡도 분석</h2>
          
          <div className="metric-explanation">
            <h3>Sample Entropy</h3>
            <p><strong>의미:</strong> 신호의 복잡도와 예측 불가능성을 나타내며, 높을수록 건강한 심박 리듬을 의미합니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              SampEn(m,r,N) = -ln(φ<sup>m+1</sup>(r) / φ<sup>m</sup>(r))
            </div>
            <p>여기서 m은 패턴 길이, r은 허용 오차, N은 데이터 길이입니다.</p>
            <p><strong>해석:</strong> 높을수록 심박 리듬이 복잡하고 건강한 상태를 의미합니다.</p>
          </div>
        </section>

        <section className="guide-section">
          <h2>5. 스트레스 분석 지표</h2>
          
          <div className="metric-explanation">
            <h3>스트레스 지수 (Stress Index)</h3>
            <p><strong>의미:</strong> 스트레스 수준을 나타내는 지표로 낮을수록 스트레스가 적습니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              Stress Index = 1000 / SDNN
            </div>
          </div>

          <div className="metric-explanation">
            <h3>자율신경계 균형 지수 (ANS Balance Index)</h3>
            <p><strong>의미:</strong> 자율신경계의 균형 상태를 나타냅니다.</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              ANS Balance = LF/HF Ratio
            </div>
          </div>

          <div className="metric-explanation">
            <h3>전체 스트레스 점수 (Overall Stress Score)</h3>
            <p><strong>의미:</strong> 종합적인 스트레스 평가 점수 (0-100점)</p>
            <p><strong>계산법:</strong></p>
            <div className="formula">
              Stress Score = (Stress Index × 0.3) + (ANS Balance × 10 × 0.2) + 
                           (Stress Resistance × 0.2) + ((100 - Recovery Index) × 0.3)
            </div>
            <p>여기서 각 지표는 정규화된 값이며, 가중치를 적용하여 계산됩니다.</p>
          </div>
        </section>

        <section className="guide-section">
          <h2>6. 데이터 전처리 과정</h2>
          
          <div className="process-step">
            <h3>1단계: 피크 검출</h3>
            <p>IR 신호에서 심박 피크를 자동으로 검출합니다.</p>
            <ul>
              <li>임계값 설정: mean + 0.5 × std</li>
              <li>최소 간격: 0.4초 (150 BPM 이상 무시)</li>
              <li>피크가 부족하면 임계값을 낮춰서 재시도</li>
            </ul>
          </div>

          <div className="process-step">
            <h3>2단계: RR 간격 계산</h3>
            <p>연속된 피크 간의 시간 간격을 계산합니다.</p>
            <ul>
              <li>기본 필터링: 300-2000ms (30-200 BPM)</li>
              <li>관대한 필터링: 200-3000ms (필요시)</li>
            </ul>
          </div>

          <div className="process-step">
            <h3>3단계: HRV 지표 계산</h3>
            <p>RR 간격 데이터를 바탕으로 각종 HRV 지표를 계산합니다.</p>
          </div>
        </section>

        <section className="guide-section">
          <h2>7. 참고사항</h2>
          <div className="note-box">
            <ul>
              <li>모든 계산은 100Hz 샘플링 주파수를 기준으로 합니다.</li>
              <li>정상 범위는 일반적인 성인 기준이며, 개인차가 있을 수 있습니다.</li>
              <li>측정 전 5분간 안정된 상태에서 측정하는 것이 권장됩니다.</li>
              <li>의학적 진단 목적으로는 사용하지 마시고, 참고용으로만 활용하세요.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HrvCalculationGuide;
