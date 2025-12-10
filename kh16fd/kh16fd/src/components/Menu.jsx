import { Link, useNavigate } from "react-router-dom";
import { FaBookOpen, FaCommentDollar, FaGear, FaGraduationCap, FaMagnifyingGlass, FaRightToBracket, FaTag, FaUserPlus } from "react-icons/fa6";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState, refreshTokenState } from "../utils/jotai";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { IoRestaurant } from "react-icons/io5";

export default function Menu() {
    //jotai state
    const [loginId, setLoginId] = useAtom(loginIdState); //읽기, 쓰기 가능
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState); //읽기, 쓰기 가능
    const [accessToken, setAccessToken] = useAtom(accessTokenState); //읽기, 쓰기 가능
    const [loginComplete, setLoginComplete] = useAtom(loginCompleteState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);
    const isLogin = useAtomValue(loginState); //읽기 전용
    const isAdmin = useAtomValue(adminState); //읽기 전용
    const clearLogin = useSetAtom(clearLoginState); //쓰기 전용

    //메뉴가 정상적으로 닫히지 않는 현상에 대한 해결(좁은 폭인 경우)
    // - 메뉴의 버튼과 영역들이 state를 거쳐가도록 처리 (단, 애니메이션은 사라짐)

    //state
    const [open, setOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setOpen(prev => !prev);
    }, []);

    //메뉴 및 외부 영역 클릭 시 메뉴가 닫히도록 처리
    // - 메뉴를 클릭했을 때 닫히게 하는 것은 메뉴에 onClick 설정을 하면 됨
    // - 메뉴가 아닌 외부 영역을 클릭했을 때 감지하고 싶다면 window에 click 또는 mousedown 이벤트 설정

    const closeMenu = useCallback(() => { setOpen(false) }, []);

    const menuRef = useRef();

    useEffect(() => {
        //클릭 감지 함수
        const listener = e => {
            //메뉴가 열려있고 클릭한 장소(e.target)가 메뉴 영역(menuRef.current)이 아니라면
            if (open === true && menuRef.current.contains(e.target) === false) {
                closeMenu();
            }
        };

        window.addEventListener("mousedown", listener);

        return () => { //clean up 함수
            window.removeEventListener("mousedown", listener);
        };
    }, [open]);

    const navigate = useNavigate();

    //화면이 로딩될 때마다 accessToken이 있는 경우 axios에 설정하는 코드 구현
    useEffect(() => {
        if (accessToken?.length > 0) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }
        //판정이 끝난 시점
        setLoginComplete(true);
    }, [accessToken]);

    //로그아웃(logout)
    const logout = useCallback(async (e) => {
        //더 이상의 이벤트 확산을 금지
        //e.stopPropagation();
        e.preventDefault(); //a 태그의 기본동작 금지

        try {
            const response = await axios.delete("/member/logout");
            //jotai state를 초기화
            //setLoginId("");
            //setLoginLevel("");
            //setAccessToken("");
            clearLogin();

            //axios에 설정된 헤더(Authorization) 제거
            delete axios.defaults.headers.common["Authorization"];

            //메인 페이지로 이동
            navigate("/");

            //closeMenu();
        }
        catch (err) {
            toast.error("잘못된 요청입니다");
        }
    }, []);

    return (
        <>
            {/* 통합 검색 영역 --- 버튼으로 구현 */}
            <nav className="navbar navbar-expand-lg bg-light" data-bs-theme="light" ref={menuRef}>
                <div className="container-fluid">
                    <Link to="/">
                        <img src="https://www.dummyimage.com/50x50/000/fff" className="ms-2 rounded navbar-brand" />
                    </Link>
                    <button className="navbar-toggler collapsed" type="button" onClick={toggleMenu} aria-controls="menu-body" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={`collapse ${open ? "show" : ""} navbar-collapse`}>
                        <ul className="navbar-nav">
                            {isLogin === true ?
                                (
                                    <>
                                        <li className="nav-item dropdown">
                                            <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><FaUser className="me-2" /></a>
                                            <div className="dropdown-menu">
                                                <Link className="nav-link" to="#" onClick={closeMenu}>
                                                    <span><FaUser className="me-2" />{loginId}</span>
                                                </Link>
                                                <Link className="nav-link" to="/restaurant/add" onClick={closeMenu}>
                                                    <span><IoRestaurant className="me-2" />식당 등록</span>
                                                </Link>
                                                <Link className="nav-link" onClick={logout}><FaRightToBracket className="me-2" /><span>로그아웃</span></Link>
                                            </div>
                                        </li>
                                    </>
                                )
                                : (
                                    <>
                                        <li className="nav-item dropdown">
                                            <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><FaUser className="me-2" /></a>
                                            <div className="dropdown-menu">
                                                <Link to="/member/join" className="nav-link"><FaUserPlus className="me-2" />회원가입</Link>
                                                <Link to="/member/login" className="nav-link"><FaRightToBracket className="me-2" /><span>로그인</span></Link>
                                            </div>
                                        </li>
                                    </>
                                )}
                            {isAdmin && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                        <FaGear className="me-2" />
                                        <span>관리 메뉴</span>
                                    </a>

                                    <div className="dropdown-menu">
                                        <Link className="dropdown-item" to="/category/list" onClick={closeMenu}>
                                            <FaTag className="me-2" />
                                            <span>카테고리 관리</span>
                                        </Link>
                                        <Link className="dropdown-item" to="/banner/list" onClick={closeMenu}>
                                            <FaTag className="me-2" />
                                            <span>배너 관리</span>
                                        </Link>
                                    </div>
                                </li>
                            )}
                        </ul>
                        <div className="input-group flex-grow-1 me-3">
                            <input className="form-control" placeholder="검색어를 입력하세요" readOnly style={{ cursor: "pointer" }} />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}