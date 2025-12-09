import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Jumbotron from "../templates/Jumbotron";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaXmark, FaCheck } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";

export default function CategoryList() {

    const [categoryList, setCategoryList] = useState([]);

    // 수정 중인 카테고리 번호
    const [editNo, setEditNo] = useState(null);

    // 임시 이름 저장
    const [editName, setEditName] = useState("");

    // 기존 이름 백업
    const [backupName, setBackupName] = useState("");

    // 데이터 로딩
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const response = await axios.get("http://localhost:8080/category/");
        setCategoryList(response.data);
    }, []);

    // 정렬
    const sort = (list) => [...list].sort((a, b) => a.categoryOrder - b.categoryOrder);

    // 트리 변환
    const makeTree = (items) => {
        const map = {};
        const roots = [];

        items.forEach(item => {
            map[item.categoryNo] = { ...item, children: [] };
        });

        items.forEach(item => {
            if (item.parentCategoryNo == null) roots.push(map[item.categoryNo]);
            else map[item.parentCategoryNo]?.children.push(map[item.categoryNo]);
        });

        return roots;
    };

    const tree = makeTree(categoryList);

    // -----------------------------
    // ▼ inline 수정 기능
    // -----------------------------

    const startEdit = (category) => {
        setEditNo(category.categoryNo);
        setEditName(category.categoryName);
        setBackupName(category.categoryName);
    };

    const cancelEdit = () => {
        setEditName(backupName);
        setEditNo(null);
    };

    const saveEdit = async (categoryNo) => {
        try {
            await axios.patch(`http://localhost:8080/category/${categoryNo}`, {
                categoryName: editName
            });

            Swal.fire("수정 완료!", "", "success");
            setEditNo(null);
            loadData();

        } catch (err) {
            Swal.fire("수정 실패!", "", "error");
            cancelEdit();
        }
    };

    // 삭제 기능
    const deleteCategory = async (categoryNo) => {
        const check = await Swal.fire({
            title: "삭제하시겠습니까?",
            text: "하위 카테고리가 있으면 삭제할 수 없습니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소"
        });

        if (!check.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:8080/category/${categoryNo}`);

            Swal.fire("삭제 완료!", "", "success");
            loadData();

        } catch (err) {
            Swal.fire("삭제 실패", "하위 카테고리가 있을 수 있습니다.", "error");
        }
    };

    return (
        <>
            <Jumbotron subject="카테고리 목록" detail="이름을 직접 수정할 수 있습니다." />

            <div className="row mt-4">
                <div className="col text-end">
                    <Link to="/category/add" className="btn btn-primary btn-lg">
                        <FaPlus /> 신규 등록
                    </Link>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <table className="table table-striped text-center">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>카테고리명</th>
                                <th>작업</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tree.map(parent => (
                                <React.Fragment key={parent.categoryNo}>

                                    {/* 상위 카테고리 */}
                                    <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
                                        <td>{parent.categoryNo}</td>

                                        {/* 🔥 inline 수정 영역 */}
                                        <td>
                                            {editNo === parent.categoryNo ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="form-control w-auto d-inline-block"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                    />
                                                    <FaXmark
                                                        className="ms-2 text-danger"
                                                        onClick={cancelEdit}
                                                        style={{ cursor: "pointer" }}
                                                    />
                                                    <FaCheck
                                                        className="ms-2 text-success"
                                                        onClick={() => saveEdit(parent.categoryNo)}
                                                        style={{ cursor: "pointer" }}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    {parent.categoryName}
                                                    <FaEdit
                                                        className="ms-2 text-warning"
                                                        onClick={() => startEdit(parent)}
                                                        style={{ cursor: "pointer" }}
                                                    />
                                                </>
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                style={{ cursor: "pointer", color: "red" }}
                                                onClick={() => deleteCategory(parent.categoryNo)}
                                            >
                                                삭제
                                            </span>
                                        </td>
                                    </tr>

                                    {/* 하위 카테고리 */}
                                    {sort(parent.children).map(child => (
                                        <tr key={child.categoryNo}>
                                            <td>{child.categoryNo}</td>

                                            <td style={{ paddingLeft: "40px" }}>
                                                {editNo === child.categoryNo ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="form-control w-auto d-inline-block"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                        />
                                                        <FaXmark
                                                            className="ms-2 text-danger"
                                                            onClick={cancelEdit}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                        <FaCheck
                                                            className="ms-2 text-success"
                                                            onClick={() => saveEdit(child.categoryNo)}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        ┗ {child.categoryName}
                                                        <FaEdit
                                                            className="ms-2 text-warning"
                                                            onClick={() => startEdit(child)}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </>
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    style={{ cursor: "pointer", color: "red" }}
                                                    onClick={() => deleteCategory(child.categoryNo)}
                                                >
                                                    삭제
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
