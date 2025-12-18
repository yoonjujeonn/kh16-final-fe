import axios from "axios";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { accessTokenState, attachmentProfileAtomState, loginIdState, loginLevelState, refreshTokenState } from "../../utils/jotai";
import Jumbotron from "../templates/Jumbotron";

export default function MemberLogin() {
    //jotai state (전체 화면에 영향을 미치는 데이터)
    const [loginId, setLoginId] = useAtom(loginIdState); //읽기, 쓰기 가능(atom)
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState); //읽기, 쓰기 가능(atom)
    const [accessToken, setAccessToken] = useAtom(accessTokenState); //읽기, 쓰기 가능(atom)
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState); //읽기, 쓰기 가능(atom)
    const [profileNo, setProfileNo] = useAtom(attachmentProfileAtomState);


    //state
    const [member, setMember] = useState({
        memberId: "",
        memberPw: ""
    });

    const [result, setResult] = useState(null); //null(시도한 적 없음), true(성공), false(실패)

    //주소 이동
    const navigate = useNavigate();

    //callback
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setMember(prev => ({ ...prev, [name]: value }));
    }, []);

    const findProfile = useCallback(async (targetId) => {
        if(!targetId) return;
        try {
            // const { data } = await axios.get(`http://192.168.20.21:8080/memberProfile/${loginId}`);
            const { data } = await axios.get(`http://localhost:8080/memberProfile/${targetId}`);
            setProfileNo(data.attachmentNo);
            console.log("프로필 번호 저장 완료:", data.attachmentNo);
        } catch (err){
            setResult(false);
            console.log("프로필 조회 실패:", err);
        }
    }, []);

    //로그인
    const sendLogin = useCallback(async () => {
        try {
            const { data } = await axios.post("/member/login", member);
            setResult(true);
            setLoginId(data.loginId);
            setLoginLevel(data.loginLevel);
            // setProfileNo()
            console.log(data);
            //data에 있는 accessToken을 axios에 설정
            // - axios의 기본 설정 중에서 헤더(header)의 Authorization 이름에 토큰값을 설정
            // - Authorization은 '인증' 정보를 의미하는 상식적인 헤더 이름
            // - 인증 정보가 'Bearer' 로 시작하면 대상자에게 권한이 부여된다는 뜻
            // - 그 외에도 Basic, Admin, Digest, ApiKey 등이 존재 (생성 가능 ... 카카오는 KakaoAK 를 사용)
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
            
            await findProfile(data.loginId);
            //새로고침 시에도 accessToken이 유지되도록 처리하는 방법
            //1. jotai state로 저장하는 방법(비교적 간단하지만 보안상 취약점 존재) --- 프론트엔드에서 해결
            //2. 서버에서 서버 전용 쿠키를 사용하는 방법 --- 백엔드에서 해결
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);

            //화면 이동
            navigate("/");
            }
        catch (err) {
            setResult(false);
            // setLoginId(data에 담긴 loginId)
            // setLoginLevel(data에 담긴 loginLevel)
        }
    }, [member, findProfile]);

    return (
        <>
        <Jumbotron subject="회원 로그인" detail="원활한 기능 이용을 위해 로그인 해주세요"></Jumbotron>
            <div className="container my-4 d-flex flex-column justify-content-center align-items-center">
                <div className="card p-4 shadow w-50">
                    <div className="my-2" style={{ height: "120px" }}>
                        <div className="form-floating">
                        <input type="text" name="memberId" value={member.memberId} onChange={changeStrValue} className="form-control" placeholder="" style={{ height: "60px" }}></input>
                        <label>아이디 입력</label>
                        </div>
                        <div className="form-floating">
                        <input type="password" name="memberPw" value={member.memberPw} onChange={changeStrValue} className="form-control border-top-0" placeholder="" style={{ height: "60px" }}></input>
                        <label>비밀번호 입력</label>
                        </div>
                    </div>
                    {result === false &&
                        <div className="row my-2">
                            <div className="col">
                                <span className="text-danger">
                                입력하신 정보가 올바르지 않습니다<br/>
                                다시 확인하고 입력해주세요
                                </span>
                            </div>
                        </div>
                    }
                     <button type="button" className={`mt-2 btn w-100 ${result === false ? "btn-danger" : "btn-success"}`} onClick={sendLogin}>로그인</button>
                </div>
            </div>
        </>
    )
}