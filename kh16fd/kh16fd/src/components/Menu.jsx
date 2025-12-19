import { Link, useNavigate } from "react-router-dom";
import {
    FaCalendar,
    FaClipboardCheck,
    FaGear, FaMagnifyingGlass, FaRightToBracket,
    FaTag, FaUserPlus
} from "react-icons/fa6";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
    accessTokenState, adminState, clearLoginState,
    loginCompleteState, loginIdState, loginLevelState,
    loginState, ownerState, refreshTokenState
} from "../utils/jotai";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { IoRestaurant } from "react-icons/io5";
import { useLogout } from "../hooks/useLogout";

export default function Menu() {
    const [loginId] = useAtom(loginIdState);
    const [loginLevel] = useAtom(loginLevelState);
    const [accessToken] = useAtom(accessTokenState);
    const [, setLoginComplete] = useAtom(loginCompleteState);
    const [, setRefreshToken] = useAtom(refreshTokenState);
    const isLogin = useAtomValue(loginState);
    const isAdmin = useAtomValue(adminState);
    const isOwner = useAtomValue(ownerState);
    const clearLogin = useSetAtom(clearLoginState);

    const [open, setOpen] = useState(false);
    const toggleMenu = useCallback(() => setOpen(prev => !prev), []);
    const closeMenu = useCallback(() => setOpen(false), []);
    const menuRef = useRef();

    useEffect(() => {
        const listener = e => {
            if (open && menuRef.current.contains(e.target) === false) {
                closeMenu();
            }
        };
        window.addEventListener("mousedown", listener);
        return () => window.removeEventListener("mousedown", listener);
    }, [open]);

    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken?.length > 0) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        }
        setLoginComplete(true);
    }, [accessToken]);

    const logout = useLogout();
    // const logout = useCallback(async (e) => {
    //     e.preventDefault();
    //     try {
    //         await axios.delete("/member/logout");
    //         clearLogin();
    //         delete axios.defaults.headers.common["Authorization"];
    //         navigate("/");
    //     } catch {
    //         toast.error("잘못된 요청입니다");
    //     }
    // }, []);

    const [keyword, setKeyword] = useState("");

    const search = useCallback(() => {
        if (!keyword.trim()) return;

        navigate("/restaurant/search", {
            state: { keyword }
        });
    }, [keyword]);

    return (
        <nav className="navbar navbar-expand-lg bg-light" ref={menuRef}>
            <div className="container-fluid">
                <Link to="/" className="ms-2 rounded navbar-brand">
                    미식 로그
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMenu}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
                    {/* 왼쪽 메뉴 */}
                    <ul className="navbar-nav me-auto">

                        {/* ===== 비회원 ===== */}
                        {!isLogin && !isOwner && !isAdmin && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/member/login">
                                        <FaRightToBracket className="me-1" />로그인
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/member/join">
                                        <FaUserPlus className="me-1" />회원가입
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/member/bizjoin">
                                        <IoRestaurant className="me-1" />비즈회원 가입
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* ===== 일반 회원 ===== */}
                        {isLogin && !isOwner && !isAdmin && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/restaurant/list">
                                        식당 목록
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/member/info">
                                        <FaUser className="me-1" />내 정보
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={logout}>
                                        로그아웃
                                    </button>
                                </li>
                            </>
                        )}

                        {/* ===== 식당 주인 ===== */}
                        {isOwner && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/restaurant/add">
                                        <IoRestaurant className="me-1" />식당 등록
                                    </Link>
                                </li>

                                {/* 내 정보 드롭다운 */}
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        data-bs-toggle="dropdown"
                                    >
                                        <FaUser className="me-1" />내 정보
                                    </a>
                                    <div className="dropdown-menu">
                                        <Link className="dropdown-item" to="/member/info">
                                            내 정보
                                        </Link>
                                        <Link className="dropdown-item" to="/owner/my-restaurant">
                                            식당 관리
                                        </Link>
                                        <Link className="dropdown-item" to="/owner/dashboard">
                                            <FaClipboardCheck className="me-2"/>예약 관리
                                        </Link>
                                    </div>
                                </li>

                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={logout}>
                                        로그아웃
                                    </button>
                                </li>
                            </>
                        )}

                        {/* ===== 관리자 ===== */}
                        {isAdmin && (
                            <>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        data-bs-toggle="dropdown"
                                    >
                                        <FaGear className="me-1" />관리 메뉴
                                    </a>
                                    <div className="dropdown-menu">
                                        <Link className="dropdown-item" to="/admin/restaurant">
                                            <FaClipboardCheck className="me-2" />
                                            미승인 레스토랑
                                        </Link>
                                        <Link className="dropdown-item" to="/category/list">
                                            <FaTag className="me-2" />카테고리 관리
                                        </Link>
                                        <Link className="dropdown-item" to="/category/image/list">
                                            <FaTag className="me-2" />카테고리 이미지
                                        </Link>
                                        <Link className="dropdown-item" to="/place/image/list">
                                            <FaTag className="me-2" />지역 이미지
                                        </Link>
                                        <Link className="dropdown-item" to="/banner/list">
                                            <FaTag className="me-2" />배너 관리
                                        </Link>
                                        <Link className="dropdown-item" to="/admin/review/list">
                                            <FaTag className="me-2" />리뷰 관리
                                        </Link>
                                    </div>
                                </li>

                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={logout}>
                                        로그아웃
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* ===== 검색창 (오른쪽 고정) ===== */}
                    <div className="d-flex">
                        <input
                            className="form-control me-2"
                            placeholder="검색어를 입력하세요"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && search()}
                        />
                        <button className="btn btn-outline-secondary" onClick={search}>
                            <FaMagnifyingGlass />
                        </button>
                    </div>
                </div>
            </div>
        </nav>

    );
}
