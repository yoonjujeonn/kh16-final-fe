import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../templates/Jumbotron";
import { useAtom } from "jotai";
import { loginIdState } from "../../utils/jotai";
import axios from "axios";
import { FaTrash } from "react-icons/fa6";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
                "memberLevelList": ["일반회원"],
                "memberStatusList": ["ACTIVE"]
            };
            const response = await axios.post('/admin/member/search', defaultParams);
            setMemberList(response.data);
            console.log("서버 응답 데이터:", response.data);
        }
        catch (err) {
            console.err("데이터 로드 실패", err);
        }
    }, []);
    const loadBizData = useCallback(async () => {
        try {
            const defaultParams = {
                "memberLevelList": ["자영업자"],
                "memberStatusList": ["ACTIVE"]
            };
            const response = await axios.post('/admin/member/search', defaultParams);
            setMemberList(response.data);
            console.log("서버 응답 데이터:", response.data);
        }
        catch (err) {
            console.err("데이터 로드 실패", err);
        }
    }, []);
    const loadDormantData = useCallback(async () => {
        try {
            const defaultParams = {
                // "memberLevelList": ["자영업자"],
                "memberStatusList": ["DORMANT"]
            };
            const response = await axios.post('/admin/member/search', defaultParams);
            setMemberList(response.data);
            console.log("서버 응답 데이터:", response.data);
        }
        catch (err) {
            console.err("데이터 로드 실패", err);
        }
    }, []);


    const [activeTab, setActiveTab] = useState("member");

    useEffect(() => {
        if (activeTab === "member") {
            loadMemberData();
        } else if (activeTab === "biz") {
            loadBizData();
        } else if (activeTab === "dorm") {
            loadDormantData();
        }
    }, [activeTab]); // 탭이 바뀔 때만 실행!





    const navigate = useNavigate();

    return (<>
        <Jumbotron bgColor="info" subject="회원 관리 페이지" detail="탈퇴 회원 되돌리기 및 회원관리를 진행해요" />

        {/*일반 회원 조회 */}
        <div className="row">
            <div className="col mt-2 mb-4">
                <button className="btn btn-primary me-2" onClick={() => setActiveTab("member")}>일반회원 조회</button>
                <button className="btn btn-secondary me-2" onClick={() => setActiveTab("biz")}>가맹회원 조회</button>
                <button className="btn btn-secondary " onClick={() => setActiveTab("dorm")}>회원 복구</button>
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
                    {/* <th>비활성화</th> */}
                    {/* <th>활성화</th> */}
                </tr>
            </thead>

            <tbody>
                {memberlist.length === 0 ? (
                    <tr>
                        <td colSpan="5">등록된 멤버가 없습니다.</td>
                    </tr>
                ) : (
                    memberlist.map(member => (
                        <tr key={member.memberId}
                            style={{cursor: "pointer"}}
                                onClick={()=>
                                    navigate(`/admin/setting/member/${member.memberId}`)
                        }>
                            <td>{member.memberId}</td>
                            <td>{member.memberNickname}</td>
                            <td>{member.memberEmail}</td>
                            <td>{member.memberContact}</td>
                            <td>{member.memberBirth}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </>)
}