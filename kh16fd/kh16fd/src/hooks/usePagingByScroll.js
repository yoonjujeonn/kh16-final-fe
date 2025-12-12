import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { throttle } from "lodash";

export default function usePagingByScroll(url) {
    const [list, setList] = useState([]);
    const [page, setPage] = useState(1);
    const loading = useRef(false);

    // 페이지 불러오기
    const loadList = useCallback(async () => {
        try {
            loading.current = true;
            const response = await axios.get(`${url}/page/${page}`);
            const data = response.data;
            if (page === 1) setList(response.data.list);
            else setList(prev => ([...prev, ...response.data.list]));
            
            loading.current = false;
        } catch (err) {
            toast.error("불러올 데이터가 없습니다");
        }
    }, [page, url]);

    // 페이지가 바뀔 때마다 load
    useEffect(() => {
        loadList();
    }, [page]);

    // 스크롤 이벤트
    const getScrollPercent = useCallback(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollHeight <= clientHeight) return 0;

        const scrollableHeight = scrollHeight - clientHeight;
        return scrollableHeight - scrollTop < 1 ? 100 : (scrollTop / scrollableHeight) * 100;
    }, []);

    useEffect(() => {
        const listener = throttle(() => {
            if (getScrollPercent() === 100 && loading.current === false) {
                setPage(prev => prev + 1);
            }
        }, 200);

        window.addEventListener("scroll", listener);
        return () => window.removeEventListener("scroll", listener);
    }, [getScrollPercent]);

    return { list, page, setPage, loadList };
}