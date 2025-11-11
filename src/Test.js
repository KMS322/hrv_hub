import React from "react";
import axios from "axios";

const Test = () => {
  const handlePrint = async () => {
    try {
      const res = await axios.post(
        "http://49.50.132.197:4000/print",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("서버에 인쇄 요청을 보냈습니다!");
      console.log(res.data);
    } catch (error) {
      console.error("인쇄 요청 중 오류 발생:", error);
      alert("인쇄 요청 실패");
    }
  };
  return (
    <div>
      <p>a</p>
      <button onClick={handlePrint}>프린트하기</button>
    </div>
  );
};

export default Test;
