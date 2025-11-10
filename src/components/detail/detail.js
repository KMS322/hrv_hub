import "../../css/detail.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../constants";

const Detail = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const navigate = useNavigate();
  const [petLists, setPetLists] = useState(null);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const address = data.address;
        const response = await axios.post(`${API_URL}/hrv/loadPets`, {
          address,
        });
        setPetLists(response.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadPets();
  }, [location]);

  const formatDate = (date) => {
    const [datePart, timePart] = date.split("-");

    const year = datePart.slice(0, 4);
    const month = datePart.slice(4, 6);
    const day = datePart.slice(6, 8);

    // 시간 분리
    const hour = timePart.slice(0, 2);
    const minute = timePart.slice(2, 4);
    const second = timePart.slice(4, 6);

    // 포맷팅
    const formatted = `${year}.${month}.${day}-${hour}:${minute}:${second}`;

    return formatted;
  };

  const downloadFile = async (fileName, type) => {
    try {
      const response = await axios.post(
        `${API_URL}/hrv/downloadFile`,
        { fileName, type },
        {
          responseType: "blob", // 중요: 파일 데이터를 blob으로 받기
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Blob 객체 생성
      const blob = new Blob([response.data], { type: "text/csv" });

      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);

      // 임시 a 태그 생성하여 다운로드 트리거
      const link = document.createElement("a");
      link.href = url;
      if (type === "customer") {
        link.download = fileName; // 다운로드될 파일명
      } else {
        link.download = fileName; // 다운로드될 파일명
      }
      document.body.appendChild(link);
      link.click();

      // 정리
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <>
      <div className="detail_container">
        <div className="head_row">
          <p>시작날짜</p>
          <p>동물이름/생년월일/종/품종/몸무게</p>
          <p>용량</p>
          <p>다운로드</p>
        </div>
        {data &&
          petLists &&
          data.files.reverse().map((list, index) => {
            console.log("list : ", list);
            const startDate = `${list.name.split("_")[2]} -${
              list.name.split("_")[3]
            }`;
            const pet = petLists.find(
              (pet) => pet.device_address === data.address
            );
            return (
              <>
                <div
                  className="body_row"
                  key={index}
                  onClick={() => {
                    // goDetailPet(list.pet_code);
                  }}
                >
                  <p>{formatDate(startDate)}</p>
                  <p>
                    {pet?.name}/{pet?.birthDate}/{pet?.species}/{pet?.breed}/
                    {pet?.weight}kg
                  </p>
                  <p>{list?.size} kb</p>
                  <div className="btn_box">
                    <p
                      className="btn"
                      onClick={() => {
                        navigate(
                          `/hrv?fileName=${encodeURIComponent(list?.name)}`
                        );
                      }}
                    >
                      hrv 보기
                    </p>
                    <p
                      className="btn"
                      onClick={() => {
                        downloadFile(list?.name, "company");
                      }}
                    >
                      다운받기
                    </p>
                  </div>
                </div>
              </>
            );
          })}
      </div>
    </>
  );
};

export default Detail;
