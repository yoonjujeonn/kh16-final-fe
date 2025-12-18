import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../../templates/Jumbotron";
import { throttle } from "lodash";
import axios from "axios";
import { Link } from "react-router-dom";

export default function RestaurantConfirm() {

    //state
    //목록
    const [notConfirmedList, setNotConfirmedList] = useState([]);
    //페이지 기억용 state
    //괄호 안에 페이지 번호
    const [page, setPage] = useState(1);
    //pageVO로 가져온 정보들 중 나머지(page는 중복땜시 걍 넣은거)를 불러오는 state
    const [info, setInfo] = useState({
        page: 0, size: 0, begin: 0, end: 0, count: 0, last: true
    });


    const loading = useRef(false);

    //effect
    useEffect(() => {
        console.log("현재 페이지 번호: ", page);
        loadData();
    }, [page]); //페이지가 변할 때마다 실행해라!

    //최초 1회 실행해 윈도우에 스크롤 이벤트 추가
    useEffect(() => {
        //함수를 변수처럼 생성
        //-lodash 라이브러리를 써서 쓰로틀링(throttle) 처리를 구현
        let beforePercent = 0;
        // console.log("이전 스크롤 퍼센트: ", beforePercent);
        const listener = throttle(e => {
            // console.log("스크롤 감지가 실행되었습니다");
            const percent = getScrollPercent();
            // console.log("현재 스크롤 위치:" + percent);

            //맨 아래에서 위로 올라간 경우
            if (beforePercent === 100 && beforePercent > percent) {
                loading.current = false;
            }

            if (percent === 100 && loading.current === false) {
                setPage(prev => prev + 1); //page를 직전값 + 1 로 변경 (=다음페이지)
            }
            beforePercent = percent;
        }, 500);

        // const listener = e =>{ console.log("스크롤 감지가 실행되었습니다")};

        window.addEventListener("scroll", listener);
        //lodash 이거로 스크롤 제어할거임
        //window.removeEventListenr 가 있는데 뭐 걸었고 뭐 지우는지 알려줘야됨

        //effect cleanup 이펙트가 종료되는 시점에 실행할 코드를 작성
        return () => {
            window.removeEventListener("scroll", listener);
        };
    }, [])

    //callback
    const loadData = useCallback(async () => {
        try {
            //로딩 시작(flag on)
            loading.current = true;
            //현재 페이징 적용해서 1번만 보여주는 중
            const response = await axios.get(`/admin/page/${page}`);
            if (page === 1) {
                setNotConfirmedList(response.data.list);
            }
            else {
                //연관항목 없이도 가능한 코드
                setNotConfirmedList(prev => ([...prev, ...response.data.list]));
            }

            //페이지 번호와 목록 데이터를 제외한 나머지를 info에 저장
            //response.data에서 list, page 빼고 others라고 부르겠다
            const { list, ...others } = response.data;
            setInfo(others);

        }
        catch (err) {
            //에러 발생시 실행하는 코드(기존의 .catch 메소드)
        }

        // console.log("loading 종료");
        loading.current = false;
        // window.scrollBy(x, y);
        // window.scrollBy(0, -100);
    }, [page]);


    /**
     * 현재 윈도우 스크롤 위치를 0-100 사이의 백분율로 반환합니다.
     * (useCallback으로 메모이제이션됨)
     */
    const getScrollPercent = useCallback(() => {
        // 현재 스크롤 Y 위치
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // 문서 전체의 스크롤 가능한 총 높이
        const scrollHeight = document.documentElement.scrollHeight;

        // 브라우저 뷰포트(창)의 높이
        const clientHeight = document.documentElement.clientHeight;

        // 스크롤이 불가능한 경우 (콘텐츠가 창보다 작음) 0 반환
        if (scrollHeight <= clientHeight) {
            return 0;
        }

        // 스크롤 가능한 실제 최대 높이 (전체 높이 - 보이는 높이)
        const scrollableHeight = scrollHeight - clientHeight;

        if (scrollableHeight - scrollTop < 1) {
            return 100;
        }

        // (현재 스크롤 위치 / 스크롤 가능한 최대 높이) * 100
        const percentage = (scrollTop / scrollableHeight) * 100;

        return percentage;
    }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성됩니다.


    return (<>
        <Jumbotron subject="식당 등록 허가" detail="등록 허가할 식당을 골라주세요" />

        {/* List Group 형태로 출력 */}
        <div className="row mt-4">
            <div className="col">
                {/* 리스트 그룹 아이템 때문에 밑에 줄 생기는건데 없에는게 좀 빡심 */}
                <ul className="list-group list-group-flush">
                    {notConfirmedList.map(restaurant => (
                        <li className="list-group-item" key={restaurant.restaurantId}>
                            <div className="p-4 shadow rounded">
                                <div className="fs-2 d-flex align-items-center">
                                    <Link to={`/admin/restaurant/${restaurant.restaurantId}`}>
                                        <span className="badge text-bg-primary" >{restaurant.restaurantName}</span>
                                    </Link>
                                    <span className="ms-4">{restaurant.ownerId}</span>
                                    <span className="text-muted ms-2">{restaurant.restaurantCreatedAt}</span>
                                </div>
                                <p>{restaurant.restaurantDescription}</p>
                            </div>
                        </li>
                    ))}

                </ul>

            </div>
        </div>


    </>)
}