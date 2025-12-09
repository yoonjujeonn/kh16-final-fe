import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { FaXmark, FaCheck } from "react-icons/fa6";

export default function CategoryDetail2() {

    const { categoryNo } = useParams();
    const navigate = useNavigate();

    // 상세 데이터
    const [category, setCategory] = useState(null);
    const [backup, setBackup] = useState(null);

    // edit 상태 저장
    const [editable, setEditable] = useState({
        categoryName: false,
        parentCategoryNo: false
    });

    // 상세 조회
    useEffect(() => {
        axios.get(`http://localhost:8080/category/${categoryNo}`)
            .then(res => {
                setCategory(res.data);
                setBackup(res.data);
            })
            .catch(err => {
                toast.error("존재하지 않는 카테고리입니다.");
                navigate("/category/list");
            });
    }, [categoryNo]);

    // 삭제
    const deleteData = useCallback(() => {
        const ok = window.confirm("정말 삭제하시겠습니까?");
        if (!ok) return;

        axios.delete(`http://localhost:8080/category/${categoryNo}`)
            .then(res => {
                toast.success("카테고리 삭제 완료");
                navigate("/category/list");
            })
            .catch(err => {
                toast.error("삭제 실패 (하위 카테고리 존재?)");
            });
    }, [categoryNo]);

    // 문자열 입력 변경 (이름)
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setCategory({ ...category, [name]: value });
    }, [category]);

    // 숫자 입력 변경 (parentCategoryNo)
    const changeNumberValue = useCallback(e => {
        const { name, value } = e.target;
        const onlyNum = value.replace(/[^0-9]/g, "");
        const number = onlyNum.length === 0 ? "" : parseInt(onlyNum);
        setCategory({ ...category, [name]: number });
    }, [category]);

    // --------- 이름 수정 저장 / 취소 ----------
    const saveName = useCallback(() => {
        axios.patch(`http://localhost:8080/category/${categoryNo}`, {
            categoryName: category.categoryName
        })
            .then(res => {
                toast.success("이름 수정 완료");
                setBackup({ ...backup, categoryName: category.categoryName });
                setEditable(prev => ({ ...prev, categoryName: false }));
            })
            .catch(err => {
                toast.error("수정 실패");
                setCategory({ ...category, categoryName: backup.categoryName });
                setEditable(prev => ({ ...prev, categoryName: false }));
            });
    }, [category, backup]);

    const cancelName = useCallback(() => {
        setCategory({ ...category, categoryName: backup.categoryName });
        setEditable(prev => ({ ...prev, categoryName: false }));
    }, [category, backup]);

    // --------- 상위 카테고리 번호 저장 / 취소 ----------
    const saveParent = useCallback(() => {
        axios.patch(`http://localhost:8080/category/${categoryNo}`, {
            parentCategoryNo: category.parentCategoryNo
        })
            .then(res => {
                toast.success("상위카테고리 변경 완료");
                setBackup({ ...backup, parentCategoryNo: category.parentCategoryNo });
                setEditable(prev => ({ ...prev, parentCategoryNo: false }));
            })
            .catch(err => {
                toast.error("수정 실패");
                setCategory({ ...category, parentCategoryNo: backup.parentCategoryNo });
                setEditable(prev => ({ ...prev, parentCategoryNo: false }));
            });
    }, [category, backup]);

    const cancelParent = useCallback(() => {
        setCategory({ ...category, parentCategoryNo: backup.parentCategoryNo });
        setEditable(prev => ({ ...prev, parentCategoryNo: false }));
    }, [category, backup]);



    if (category === null) {
        return (
            <div className="row mt-4">
                <div className="col d-flex justify-content-center">
                    <HashLoader size={100} color="#8e44ad" />
                </div>
            </div>
        );
    }

    return (
        <>
            <Jumbotron
                subject={`${categoryNo}번 카테고리 상세`}
                detail="카테고리 상세 정보 및 수정"
            />

            {/* 번호 */}
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">번호</div>
                <div className="col-sm-9">{category.categoryNo}</div>
            </div>

            {/* 이름 */}
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">이름</div>
                <div className="col-sm-9 d-flex align-items-center">

                    {editable.categoryName ? (
                        <>
                            <input
                                type="text"
                                name="categoryName"
                                className="form-control w-auto"
                                value={category.categoryName}
                                onChange={changeStrValue}
                            />
                            <FaXmark className="ms-4" onClick={cancelName} />
                            <FaCheck className="ms-2" onClick={saveName} />
                        </>
                    ) : (
                        <>
                            {category.categoryName}
                            <FaEdit
                                className="ms-4"
                                onClick={() =>
                                    setEditable(prev => ({ ...prev, categoryName: true }))
                                }
                            />
                        </>
                    )}

                </div>
            </div>

            {/* 상위 카테고리 */}
            <div className="row mt-4 fs-2">
                <div className="col-sm-3 text-primary">상위 카테고리</div>
                <div className="col-sm-9 d-flex align-items-center">

                    {editable.parentCategoryNo ? (
                        <>
                            <input
                                type="text"
                                name="parentCategoryNo"
                                className="form-control w-auto"
                                value={category.parentCategoryNo ?? ""}
                                onChange={changeNumberValue}
                            />
                            <FaXmark className="ms-4" onClick={cancelParent} />
                            <FaCheck className="ms-2" onClick={saveParent} />
                        </>
                    ) : (
                        <>
                            {category.parentCategoryNo ?? "-"}
                            <FaEdit
                                className="ms-4"
                                onClick={() =>
                                    setEditable(prev => ({ ...prev, parentCategoryNo: true }))
                                }
                            />
                        </>
                    )}

                </div>
            </div>

            {/* 버튼 */}
            <div className="row mt-5">
                <div className="col">
                    <Link to="/category/add" className="btn btn-success">신규등록</Link>
                    <Link to="/category/list" className="btn btn-secondary ms-2">목록보기</Link>
                    <button className="btn btn-danger ms-2" onClick={deleteData}>
                        삭제하기
                    </button>
                </div>
            </div>
        </>
    );
}
