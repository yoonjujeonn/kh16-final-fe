import { Link, useNavigate } from "react-router-dom";
import {
    FaGear, FaMagnifyingGlass, FaRightToBracket,
    FaTag, FaUserPlus
} from "react-icons/fa6";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
    accessTokenState, adminState, clearLoginState,
    loginCompleteState, loginIdState, loginLevelState,
    loginState, refreshTokenState
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
                <Link to="/">
                    <img
                        src="https://www.dummyimage.com/50x50/000/fff"
                        className="ms-2 rounded navbar-brand"
                    />
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMenu}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse ${open ? "show" : ""} navbar-collapse`}>
                    <ul className="navbar-nav">
                        {isLogin ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                                    <FaUser />
                                </a>
                                <div className="dropdown-menu">
                                    <span className="dropdown-item">{loginId}</span>
                                    <Link className="dropdown-item" to="/restaurant/add">
                                        <IoRestaurant className="me-2" />식당 등록
                                    </Link>
                                    <Link className="dropdown-item" onClick={logout}>
                                        <FaRightToBracket className="me-2" />로그아웃
                                    </Link>
                                </div>
                            </li>
                        ) : (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                                    <FaUser />
                                </a>
                                <div className="dropdown-menu">
                                    <Link to="/member/join" className="dropdown-item">
                                        <FaUserPlus className="me-2" />회원가입
                                    </Link>
                                    <Link to="/member/login" className="dropdown-item">
                                        <FaRightToBracket className="me-2" />로그인
                                    </Link>
                                </div>
                            </li>
                        )}

                        {isAdmin && (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                                    <FaGear className="me-2" />관리 메뉴
                                </a>
                                <div className="dropdown-menu">
                                    <Link className="dropdown-item" to="/category/list">
                                        <FaTag className="me-2" />카테고리 관리
                                    </Link>
                                    <Link className="dropdown-item" to="/category/image/list">
                                        <FaTag className="me-2" />카테고리 이미지 관리
                                    </Link>
                                    <Link className="dropdown-item" to="/banner/list">
                                        <FaTag className="me-2" />배너 관리
                                    </Link>
                                </div>
                            </li>
                        )}
                    </ul>

                    {/* 🔍 검색 UI */}
                    <div className="input-group flex-grow-1 ms-3">
                        <input
                            className="form-control"
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
