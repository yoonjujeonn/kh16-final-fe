import axios from "axios";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { clearLoginState } from "../utils/jotai";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";


export function useLogout() {
        const navigate = useNavigate();
        const clearLogin = useSetAtom(clearLoginState);
        const logout = useCallback(async () => {
        try {
            await axios.delete("/member/logout");
            clearLogin();
            delete axios.defaults.headers.common["Authorization"];
            navigate("/");
        } catch {
            toast.error("잘못된 요청입니다");
        }
    }, [clearLogin, navigate]);

    return logout;
}