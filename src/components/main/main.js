import "../../css/main.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constants";
import dayjs from "dayjs";

const Main = () => {
  const navigate = useNavigate();
  const [orgLists, setOrgLists] = useState([]);
  const [dataLists, setDataLists] = useState([]);
  useEffect(() => {
    const loadOrg = async () => {
      try {
        const response = await axios.get(`${API_URL}/hrv/loadOrg`);
        const responseDatas = await axios.get(`${API_URL}/hrv/loadDatas`);
        // console.log("response : ", response.data);
        // console.log("responseDatas : ", responseDatas.data);
        setOrgLists(response.data);
        setDataLists(responseDatas.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadOrg();
  }, []);

  const goDetail = (name, data) => {
    navigate(`detail/${encodeURIComponent(name)}`, { state: { data } });
  };

  const formatFileNameToDate = (fileName) => {
    // 확장자 제거
    if (fileName) {
      const pure = fileName?.replace(".csv", "");

      // 연, 월, 일, 시, 분, 초 추출
      const year = pure.slice(0, 4);
      const month = pure.slice(4, 6);
      const day = pure.slice(6, 8);
      const hour = pure.slice(8, 10);
      const minute = pure.slice(10, 12);
      const second = pure.slice(12, 14);

      return `${year}.${month}.${day} - ${hour}:${minute}:${second}`;
    } else {
      return null;
    }
  };

  return (
    <>
      <div className="main_container">
        <div className="head_row">
          <p>기관명</p>
          <p>디바이스명</p>
          <p>최신 업데이트</p>
          <p>총 파일 수</p>
        </div>
        {dataLists &&
          dataLists?.map((data, index) => {
            const createDates = data.files.map((file) => {
              return file.name.split("_")[2] + file.name.split("_")[3];
            });
            const latest = createDates.sort().pop();
            console.log("latest : ", latest);
            // console.log("data : ", data.name);
            return (
              <div
                className="body_row"
                onClick={() => {
                  goDetail(data.name, data);
                }}
                key={index}
              >
                <p>{orgLists[0].name}</p>
                <p>{data.name}</p>
                <p>{formatFileNameToDate(latest)}</p>
                <p>{data.files.length}</p>
              </div>
            );
            // }
          })}
      </div>
    </>
  );
};

export default Main;
