import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import axios from "axios";
import { FaTrash } from "react-icons/fa6";

export default function AdminSetting() {

    // 관리자 조회용
    const [loginId, setLoginId] = useAtom(loginIdState);

    // 회원 조회(뭉탱이)
    const [memberlist, setMemberList] = useState([]);

    const loadData = useCallback(async () => {
        try {
            const defaultParams = {
                "memberLevelList": ["일반회원", "자영업자"] // 또는 전체를 보고 싶다면 ["일반회원", "우수회원"] 등
            };
            const response = await axios.post('/admin/member/search', defaultParams);
            setMemberList(response.data);
            console.log("서버 응답 데이터:", response.data); // <-- 이걸 추가해서 개발자 도구(F12) 콘솔을 보세요!
        }
        catch (err) {
            console.err("데이터 로드 실패", err);
        }
    }, []);

    const deleteMember = useCallback(async ()=> {
        try {
            const response = await axios.patch(`/admin/${memberId}/deactivate`);
        }
        catch (err) {

        }
    }, []);

    //아 씨발 검색 대체 어케하는건데 지금 검색 안하면 안에 내용물이 안와!

    useEffect(() => {
        loadData();
    }, [loadData]);


    return (<>
        <Jumbotron bgColor="info" subject="회원 관리 페이지" detail="탈퇴 회원 되돌리기 및 회원관리를 진행해요" />

        {/* 회원조회 */}
        <table className="table table-bordered table-hover text-center">
            <thead>
                <tr>
                    <th>아이디</th>
                    <th>닉네임</th>
                    <th>이메일</th>
                    <th>전화번호</th>
                    <th>생년월일</th>
                    <th>탈퇴</th>
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
                                    onClick={() => deleteBanner(member.memberId)}
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