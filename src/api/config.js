import axios from 'axios';

// 원격 서버 IP 설정
const REMOTE_SERVER_URL = 'http://211.188.55.131:3060';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: REMOTE_SERVER_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (필요시 인증 토큰 등을 추가)
apiClient.interceptors.request.use(
  (config) => {
    console.log('API 요청:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API 에러:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient; 