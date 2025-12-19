import { Link } from "react-router-dom";
import { FaUpRightFromSquare } from "react-icons/fa6";
import { FaGoogle, FaLine, FaGithub, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer () {
     return (
        <footer className="footer mt-auto py-4 bg-light">
            {/* 가운데 정렬 + 적당한 최대 폭 */}
            <div className="container">
                <div className="row">

                    {/* 회사 정보 */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <h5 className="fs-2">미식 로그</h5>
                        <div className="d-flex flex-column small">
                            <span>사업자등록번호 : 123-12-12345</span>
                            <span>사업자등록번호 : 234-34-23456</span>
                            <span>서울 강남 제2025-01호</span>
                            <span>대표자 : 김미식</span>
                            <span>책임자 : 김미식</span>
                            <span>개인정보관리책임자 : 김미식</span>
                        </div>
                    </div>

                    {/* 제휴 정보 */}
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <h5 className="fs-2">제휴 정보</h5>
                        <div className="d-flex flex-column small">
                            <span>맛집기행 <Link to="#"><FaUpRightFromSquare className="ms-2"/></Link></span>
                            <span>미슐랭 가이드 <Link to="#"><FaUpRightFromSquare className="ms-2"/></Link></span>
                            <span>오늘의 맛집 <Link to="#"><FaUpRightFromSquare className="ms-2"/></Link></span>
                            
                        </div>
                    </div>

                    {/* 운영방침 + 파트너쉽 */}
                    <div className="col-12 col-md-12 col-lg-4 mb-4">
                        <h5 className="fs-2">운영 방침</h5>
                        <div className="d-flex flex-column small mb-3">
                            <Link to="#" className="text-decoration-none mb-1">이용 약관</Link>
                            <Link to="#" className="text-decoration-none">개인정보 처리 방침</Link>
                        </div>

                        <h5 className="fs-2">파트너쉽</h5>
                        <div className="d-flex align-items-center mt-2">
                            <FaGoogle className="me-2" size={24} />
                            <FaLine className="me-2" size={24} />
                            <FaFacebook className="me-2" size={24} />
                            <FaInstagram className="me-2" size={24} />
                            <FaGithub className="me-2" size={24} />
                            <FaLinkedin className="me-2" size={24} />
                        </div>
                        <div>
                            <Link to="/member/bizJoin">입점을 원하시면 가입하세요!</Link>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    )
}