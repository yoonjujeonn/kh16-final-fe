import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Jumbotron from "../templates/Jumbotron";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function CategoryAdd() {

    // 입력값 state
    const [category, setCategory] = useState({
        categoryName: "",
        parentCategoryNo: "",
        categoryOrder: ""
    });

    // css 유효성 class
    const [categoryClass, setCategoryClass] = useState({
        categoryName: "",
        categoryOrder: ""
    });

    // 상위 카테고리 선택용 목록
    const [categoryList, setCategoryList] = useState([]);

    // 첫 로딩 → 상위 카테고리 목록 가져오기
    useEffect(() => {
        axios.get("http://localhost:8080/category/")
            .then(res => {
                setCategoryList(res.data);
            })
            .catch(err => {
                console.log("카테고리 목록 조회 실패", err);
            });
    }, []);

    // 서버로 등록 요청
    const sendData = useCallback(() => {

        axios({
            url: "http://localhost:8080/category/",
            method: "post",
            data: {
                categoryName: category.categoryName,
                parentCategoryNo: category.parentCategoryNo === "" ? null : Number(category.parentCategoryNo),
                categoryOrder: Number(category.categoryOrder)
            }
        })
        .then(() => {
            toast.success("카테고리 등록 완료!");

            // 초기화
            setCategory({
                categoryName: "",
                parentCategoryNo: "",
                categoryOrder: ""
            });

            setCategoryClass({
                categoryName: "",
                categoryOrder: ""
            });
        })
        .catch(err => {
            toast.error("등록 실패");
            console.log(err);
        });
    }, [category]);

    return (
        <>
            <Jumbotron subject="카테고리 등록" detail="새로운 카테고리를 입력하세요" />

            {/* 카테고리명 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">카테고리명</label>
                <div className="col-sm-9">
                    <input type="text"
                        className={"form-control " + categoryClass.categoryName}
                        value={category.categoryName}
                        onChange={e => {
                            setCategory({
                                ...category,
                                categoryName: e.target.value
                            });
                        }}
                        onBlur={() => {
                            setCategoryClass({
                                ...categoryClass,
                                categoryName: category.categoryName ? "is-valid" : "is-invalid"
                            });
                        }}
                    />
                    <div className="valid-feedback">좋은 이름이에요!</div>
                    <div className="invalid-feedback">카테고리명을 입력하세요.</div>
                </div>
            </div>

            {/* 상위 카테고리 선택 */}
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">상위 카테고리</label>
                <div className="col-sm-9">
                    <select
                        className="form-select"
                        value={category.parentCategoryNo}
                        onChange={e => {
                            setCategory({
                                ...category,
                                parentCategoryNo: e.target.value
                            });
                        }}
                    >
                        <option value="">(상위 없음)</option>

                        {/* 🔥 여기 추가! 최상위(부모 없음) 카테고리만 보여주기 */}
                        {categoryList
                            .filter(c => c.parentCategoryNo === null)
                            .map(c => (
                                <option key={c.categoryNo} value={c.categoryNo}>
                                    {c.categoryName}
                                </option>
                            ))
                        }

                    </select>
                </div>
            </div>

            {/* 등록 버튼 */}
            <div className="row mt-4">
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-success btn-lg w-100"
                        onClick={sendData}
                        disabled={!category.categoryName}
                    >
                        등록하기
                    </button>
                </div>
            </div>

            {/* 홈으로 이동 */}
            <div className="row mt-4">
                <div className="col">
                    <Link to="/" className="btn btn-secondary w-100">홈으로</Link>
                </div>
            </div>
        </>
    );
}
