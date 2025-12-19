import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import axios from "axios";
import { FaTrash } from "react-icons/fa6";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function AdminSetting() {

    // 관리자 조회용
    const [loginId, setLoginId] = useAtom(loginIdState);

    // 일반 회원 조회(뭉탱이)
    const [memberlist, setMemberList] = useState([]);
    // 비즈니스 회원 조회(일부)
    const [bizMemberlist, setBizMemberList] = useState([]);

    const loadMemberData = useCallback(async () => {
        try {
            const defaultParams = {
                "memberLevelList": ["일반회원"] // 또는 전체를 보고 싶다면 ["일반회원", "우수회원"] 등
            };
            const response = await axios.post('/admin/member/search', defaultParams);
            setMemberList(response.data);
            console.log("서버 응답 데이터:", response.data); // <-- 이걸 추가해서 개발자 도구(F12) 콘솔을 보세요!
        }
        catch (err) {
            console.err("데이터 로드 실패", err);
        }
    }, []);
    const loadBizData = useCallback(async () => {
        try {
            const defaultParams = {
                "memberLevelList": ["자영업자"] // 또는 전체를 보고 싶다면 ["일반회원", "우수회원"] 등
            };
            const response = await axios.post('/admin/member/search', defaultParams);
            setMemberList(response.data);
            console.log("서버 응답 데이터:", response.data); // <-- 이걸 추가해서 개발자 도구(F12) 콘솔을 보세요!
        }
        catch (err) {
            console.err("데이터 로드 실패", err);
        }
    }, []);

    const deleteMember = useCallback(async () => {
        try {
            const response = await axios.patch(`/admin/${memberId}/deactivate`);
        }
        catch (err) {

        }
    }, []);

    const [activeTab, setActiveTab] = useState("member");

    useEffect(() => {
        if (activeTab === "member") {
            loadMemberData();
        } else if (activeTab === "biz") {
            loadBizData();
        }
    }, [activeTab]); // 탭이 바뀔 때만 실행!



    // 회원탈퇴
    const memberWithdraw = useCallback(async (targetId) => {

        const result = await Swal.fire({
            title: "탈퇴시킵니까?",
            text: "이 작업은 되돌릴 수 없습니다",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "탈퇴",
            cancelButtonText: "취소",
            allowOutsideClick: false
        });

        if (!result.isConfirmed) {
            return;
        }



        try {
            const response = await axios.patch(`/member/${targetId}/deactivate`);
            console.log(response.data);
            if (response.data === true) {
                await Swal.fire({
                    title: "탈퇴완료",
                    text: "성공적으로 탈퇴되었습니다",
                    icon: "success"
                });
            }
            else {
                toast.error("탈퇴 처리 중 문제가 발생했습니다");
            }
        }
        catch (err) {
            await Swal.fire({
                title: "오류 발생",
                text: "탈퇴 처리 중 문제가 발생했습니다.",
                icon: "error"
            });
            console.log(err);
            toast.error("유효하지 않은 요청입니다");
        }
    }, []);


    return (<>
        <Jumbotron bgColor="info" subject="회원 관리 페이지" detail="탈퇴 회원 되돌리기 및 회원관리를 진행해요" />

        {/*일반 회원 조회 */}
        <div className="row">
            <div className="col mt-2 mb-4">
                <button className="btn btn-primary me-2" onClick={()=>setActiveTab("member")}>일반회원 조회</button>
                <button className="btn btn-secondary" onClick={()=>setActiveTab("biz")}>가맹회원 조회</button>
            </div>
        </div>

        <table className="table table-bordered table-hover text-center">
            <thead>
                <tr>
                    <th>아이디</th>
                    <th>닉네임</th>
                    <th>이메일</th>
                    <th>전화번호</th>
                    <th>생년월일</th>
                    <th>비활성화</th>
                    <th>활성화</th>
                </tr>
            </thead>

            <tbody>
                {memberlist.length === 0 ? (
                    <tr>
                        <td colSpan="6">등록된 배너가 없습니다.</td>
                    </tr>
                ) : (
                    memberlist.map(member => (
                        <tr key={member.memberId}>
                            <td>{member.memberId}</td>
                            <td>{member.memberNickname}</td>
                            <td>{member.memberEmail}</td>
                            <td>{member.memberContact}</td>
                            <td>{member.memberBirth}</td>
                            <td>
                                <button
                                    className="btn btn-danger btn-sm"
                                    type="submit"
                                    onClick={() => memberWithdraw(member.memberId)}
                                >
                                    <FaTrash />
                                </button>
                            </td>
                            <td>
                                <button
                                    className="btn btn-info btn-sm"
                                    type="submit"
                                    onClick={() => memberWithdraw(member.memberId)}
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </>)
}