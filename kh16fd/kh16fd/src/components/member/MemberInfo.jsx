import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Jumbotron from "../templates/Jumbotron";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { attachmentProfileAtomState, loginIdState, loginLevelState, profileImageUrlAtom } from "../../utils/jotai";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function MemberInfo() {


    //state
    const [loginId, setloginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [profileNo, setProfileNo] = useAtom(attachmentProfileAtomState);

    // const {loginId} = useParams();
    const [member, setMember] = useState(null);

    const profileUrl = useAtomValue(profileImageUrlAtom);

    // const[member, setMember] = useState(
    //     member


    // );

    const navigate = useNavigate();

    useEffect(() => {
        if (loginId?.length === 0) return;
        // 추후에 비회원이 멤버 페이지로 못들어오게 하려면 쓸것
        // if (loginId?.length === 0) navigate("/");
        console.log(loginId.length);

        axios({
            url: `/member/${loginId}`,
            method: "get"
        }).then(response => {
            setMember(response.data);
        }).catch(err => {
            toast.error(`${loginId}회원은 존재하지 않습니다`);
            navigate("/");
        });
    }, [loginId]);



    // useEffect(()=> {
    //     axios.get(`http://192.168.20.21:8080/memberProfile/${loginId}`)
    //     .then(set);
    // }, [loginId]);



    return (<>
        <h1>{loginId} 님의 정보</h1>

        {/* 중첩 라우팅은 당분간 중지 */}
        {/* <div className="row mt-4">
            <div className="col">
                <Outlet/>
            </div>
        </div> */}
        <div className="container border rounded mt-4 p-4">
            <div className="row p-2">
            <div className="d-flex justify-content-between">
                <Link className="list-group-item text-secondary fs-3" to="/member/info/change">내정보 변경</Link>
                {/* 이거는 조건 따져서 가리면 됨 */}
                <Link className="list-group-item text-secondary fs-3" to="/member/info/reservation">나의 예약/결제</Link>
                <Link className="list-group-item text-secondary fs-3" to="/member/info/review">나의 리뷰</Link>
                <Link className="list-group-item text-secondary fs-3" to="/member/info/wishlist">위시리스트</Link>
            </div>
        </div>
        <hr className="my-4"/>
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">프로필 이미지</div>
                <div className="col-sm-9">
                    <img
                        src={profileUrl}
                        className="border rounded"
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
        </div>
    </>)
}