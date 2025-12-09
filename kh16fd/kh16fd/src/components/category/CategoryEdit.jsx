import { useNavigate, useParams } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

export default function CategoryEdit() {

    // categoryNo 파라미터 수신
    const { categoryNo } = useParams();

    // 페이지 이동 도구
    const navigate = useNavigate();

    // state
    const [category, setCategory] = useState({
        categoryName: "",
        parentCategoryNo: "",
        categoryOrder: "",
    });

    // 데이터 불러오기
    useEffect(() => {
        axios({
            url: `http://localhost:8080/category/${categoryNo}`,
            method: "get"
        })
            .then(response => {
                setCategory(response.data); // 기존 데이터 입력
            })
            .catch(err => {
                toast.error("존재하지 않는 카테고리입니다");
            });
    }, []);

    // 문자열 변경 처리
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setCategory({
            ...category,
            [name]: value
        });
    }, [category]);

    // 숫자 변경 처리
    const changeNumberValue = useCallback(e => {
        const { name, value } = e.target;
        const onlyNumber = value.replace(/[^0-9]/g, "");
        const numberValue = onlyNumber.length === 0 ? 0 : parseInt(onlyNumber);

        setCategory({
            ...category,
            [name]: numberValue
        });
    }, [category]);

    // 수정 데이터 전송
    const sendData = useCallback(() => {

        axios({
            url: `http://localhost:8080/category/${categoryNo}`,
            method: "put",
            data: category
        })
            .then(response => {
                toast.success("카테고리 수정 완료");
                navigate(`/category/list`);
            })
            .catch(err => {
                toast.error("카테고리 수정 중 오류 발생");
            });

    }, [category]);

    // 화면 렌더링
    return (
        <>
            <Jumbotron 
                subject={`${categoryNo}번 카테고리 수정`} 
                detail="카테고리 정보를 변경하세요" 
            />

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">카테고리명</label>
                <div className="col">
                    <input 
                        type="text" 
                        name="categoryName" 
                        className="form-control"
                        value={category.categoryName}
                        onChange={changeStrValue}
                    />
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">상위 카테고리 번호</label>
                <div className="col">
                    <input 
                        type="text" 
                        name="parentCategoryNo"
                        className="form-control"
                        value={category.parentCategoryNo ?? ""}
                        onChange={changeNumberValue}
                    />
                </div>
            </div>

            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">정렬 순서</label>
                <div className="col">
                    <input 
                        type="text" 
                        name="categoryOrder" 
                        className="form-control"
                        value={category.categoryOrder}
                        onChange={changeNumberValue}
                    />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-end">
                    <button 
                        type="button" 
                        className="btn btn-success btn-lg w-100"
                        onClick={sendData}
                    >
                        <FaEdit className="me-2"/>
                        <span>수정하기</span>
                    </button>
                </div>
            </div>
        </>
    );
}
