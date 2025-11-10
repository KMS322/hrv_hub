import apiClient from './config';

// 데이터 폴더 목록 조회 (원격 서버에 해당 API가 있어야 함)
export const getDataFolders = async () => {
  try {
    const response = await apiClient.get('/data/folders');
    return response.data;
  } catch (error) {
    console.error('폴더 목록 조회 실패:', error);
    throw error;
  }
};

// 특정 폴더의 파일 목록 조회
export const getFolderFiles = async (folderName) => {
  try {
    const response = await apiClient.get(`/data/folders/${folderName}/files`);
    return response.data;
  } catch (error) {
    console.error('파일 목록 조회 실패:', error);
    throw error;
  }
};

// CSV 데이터 로드 (기존 API 활용)
export const loadCsvData = async (date, pet_code, device_code) => {
  try {
    const response = await apiClient.post('/data/load', {
      date,
      pet_code,
      device_code
    });
    return response.data;
  } catch (error) {
    console.error('CSV 데이터 로드 실패:', error);
    throw error;
  }
};

// CSV 파일 다운로드
export const downloadCsvFile = async (filename) => {
  try {
    const response = await apiClient.post('/data/downloadCSV', {
      filename
    }, {
      responseType: 'blob' // 파일 다운로드를 위한 설정
    });
    
    // 파일 다운로드 처리
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('파일 다운로드 실패:', error);
    throw error;
  }
};

// 서버 연결 상태 확인
export const checkServerConnection = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error('서버 연결 실패:', error);
    throw error;
  }
}; 