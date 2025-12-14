import { useEffect } from "react";

export function usePreventRefresh(isEntered) {
  // 브라우저 기본 새로고침 / 탭 닫기 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEntered) {
        e.preventDefault();
        e.returnValue = ""; // Chrome 필요
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEntered]);

  return {};
}
