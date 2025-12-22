import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { accessTokenState, profileImageUrlAtom } from "../../../utils/jotai";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { FaTrash } from "react-icons/fa6";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function AdminMemberInfo() {

    const navigate = useNavigate();
    const { memberId } = useParams();
    const [accessToken] = useAtom(accessTokenState);
    const [profile, setProfile] = useState(null);
    // const profileUrl = useAtomValue(profileImageUrlAtom);

    const [member, setMember] = useState(null);
    // const [loading, setLoading] = useState(true);

    const [deactive, setDeactive] = useState(null);
    const [active, setActive] = useState(null);

    useEffect(() => {
        if (!accessToken) return;
        axios.get(`/admin/${memberId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
            .then(member => {
                loadData();
                setMember(member.data);
                console.log(member.data);
                // if (member.memberStatus === "ACTIVE") {
                //     setDeactive("none");
                // }
                // else if (member.memberStatus === "DORMANT") {
                //     setActive("none");
                //     console.log("현재 상태:", member.memberStatus);

                // }
            })
            .catch(() => {
                toast.error("회원 정보를 불러올 수 없습니다");
                navigate("/admin/setting");
            });
    }, [memberId, accessToken, navigate]);

    const loadData = useCallback(async () => {
        try {
            const response = await axios.get(`http://192.168.20.12:8080/memberProfile/${memberId}`);
            setProfile(response.data);
        } catch (e) { 
            console.log(e);
        }
    }, [memberId])

    // 회원탈퇴
    const memberWithdraw = useCallback(async () => {

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
            const response = await axios.patch(`/member/${memberId}/deactivate`);
            console.log(response.data);
            if (response.data === true) {
                await Swal.fire({
                    title: "탈퇴완료",
                    text: "성공적으로 탈퇴되었습니다",
                    icon: "success"
                });
                navigate("/admin/setting")
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

    // 회원탈퇴
    const memberReactive = useCallback(async () => {

        const result = await Swal.fire({
            title: "복구시킵니까?",
            text: "이 작업은 되돌릴 수 없습니다",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "복구",
            cancelButtonText: "취소",
            allowOutsideClick: false
        });

        if (!result.isConfirmed) {
            return;
        }



        try {
            const response = await axios.patch(`/member/${memberId}/reactivate`);
            console.log(response.data);
            if (response.data === true) {
                await Swal.fire({
                    title: "복구완료",
                    text: "성공적으로 복구되었습니다",
                    icon: "success"
                });
                navigate("/admin/setting")
            }
            else {
                toast.error("복구 처리 중 문제가 발생했습니다");
            }
        }
        catch (err) {
            await Swal.fire({
                title: "오류 발생",
                text: "복구 처리 중 문제가 발생했습니다.",
                icon: "error"
            });
            console.log(err);
            toast.error("유효하지 않은 요청입니다");
        }
    }, []);

    return (<>

        <h1>{member?.memberNickname} 님의 정보</h1>


        <div className="container border rounded mt-4 p-4">
            <hr className="my-4" />
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">프로필 이미지</div>
                <div className="col-sm-9">
                    <img
                        src={profile && profile.attachmentNo
                            ? `http://192.168.20.12:8080/attachment/${profile.attachmentNo}`
                            : "https://dummyimage.com/300X300/a6a6a6/fff.png&text=no+profile"
                        }
                        className="border rounded"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                </div>
            </div>
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">닉네임</div>
                <div className="col-sm-9">{member?.memberNickname}</div>
            </div>
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">생년월일</div>
                <div className="col-sm-9">{member?.memberBirth}</div>
            </div>
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">연락처</div>
                <div className="col-sm-9">{member?.memberContact}</div>
            </div>
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">이메일</div>
                <div className="col-sm-9">{member?.memberEmail}</div>
            </div>

            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">우편번호</div>
                <div className="col-sm-9">{member?.memberPost}</div>
            </div>
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">기본주소</div>
                <div className="col-sm-9">{member?.memberAddress1}</div>
            </div>
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">상세주소</div>
                <div className="col-sm-9">{member?.memberAddress2}</div>
            </div>
            <button
                className={`btn btn-danger mt-4 ${member?.memberStatus === "DORMANT" ? "d-none" : ""}`}
                type="submit"
                onClick={() => memberWithdraw(member.memberId)}
            >
                <span>회원 탈퇴 </span>
                <FaTrash />
            </button>
            <button
                className={`btn btn-primary mt-4 ${member?.memberStatus === "ACTIVE" ? "d-none" : ""}`}
                type="submit"
                onClick={() => memberReactive(member.memberId)}
            >
                <span>회원 복구 </span>
                <FaTrash />
            </button>

            {/* ACTIVE 상태일 때만 탈퇴 버튼 표시 */}
            {/* {member?.memberStatus === "ACTIVE" && (
                <button
                    className="btn btn-danger mt-4"
                    onClick={() => memberWithdraw(member.memberId)}
                >
                    <span>회원 탈퇴 </span>
                    <FaTrash />
                </button>
            )} */}

            {/* DORMANT(휴면) 상태일 때만 복구 버튼 표시 */}
            {/* {member?.memberStatus === "DORMANT" && (
                <button
                    className="btn btn-success mt-4" // 복구는 보통 초록색(success)을 씁니다
                    onClick={() => memberReactive(member.memberId)}
                >
                    <span>회원 복구 </span>
                    <FaTrash />
                </button>
            )} */}

        </div>

    </>)
}