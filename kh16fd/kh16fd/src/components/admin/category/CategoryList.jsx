import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Jumbotron from "../../templates/Jumbotron";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaXmark, FaCheck, FaPenToSquare } from "react-icons/fa6";

export default function CategoryList() {

    const [categoryList, setCategoryList] = useState([]);
    const [editNo, setEditNo] = useState(null);
    const [editName, setEditName] = useState("");
    const [backupName, setBackupName] = useState("");

    useEffect(() => { loadData(); }, []);

    const loadData = useCallback(async () => {
        const response = await axios.get("http://localhost:8080/category/");
        setCategoryList(response.data);
    }, []);

    const sort = (list) => [...list].sort((a, b) => a.categoryOrder - b.categoryOrder);

    const makeTree = (items) => {
        const map = {}, roots = [];
        items.forEach(item => { map[item.categoryNo] = { ...item, children: [] }; });
        items.forEach(item => {
            item.parentCategoryNo == null
                ? roots.push(map[item.categoryNo])
                : map[item.parentCategoryNo]?.children.push(map[item.categoryNo]);
        });
        return roots;
    };

    const tree = makeTree(categoryList);

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
            await axios.patch(
                `http://localhost:8080/admin/category/${categoryNo}`,
                { categoryName: editName },
                { withCredentials: true }
            );
            setEditNo(null);
            loadData();
        } catch (err) {
            cancelEdit();
        }
    };

    const deleteCategory = async (categoryNo) => {
        if (!window.confirm("정말 삭제하시겠습니까?\n하위 카테고리가 있으면 삭제할 수 없습니다.")) return;

        try {
            await axios.delete(
                `http://localhost:8080/admin/category/${categoryNo}`,
                { withCredentials: true }
            );
            loadData();
        } catch (err) {}
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

                                    <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
                                        <td>{parent.categoryNo}</td>
                                        <td>
                                            {editNo === parent.categoryNo ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="form-control w-auto d-inline-block"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                    />
                                                    <FaXmark className="ms-2 text-danger" onClick={cancelEdit} />
                                                    <FaCheck className="ms-2 text-success"
                                                        onClick={() => saveEdit(parent.categoryNo)} />
                                                </>
                                            ) : (
                                                <>
                                                    {parent.categoryName}
                                                    <FaPenToSquare className="ms-2 text-warning"
                                                        onClick={() => startEdit(parent)} />
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            <FaTrash className="text-danger"
                                                onClick={() => deleteCategory(parent.categoryNo)} />
                                        </td>
                                    </tr>

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
                                                        <FaXmark className="ms-2 text-danger" onClick={cancelEdit} />
                                                        <FaCheck className="ms-2 text-success"
                                                            onClick={() => saveEdit(child.categoryNo)} />
                                                    </>
                                                ) : (
                                                    <>
                                                        ┗ {child.categoryName}
                                                        <FaPenToSquare className="ms-2 text-warning"
                                                            onClick={() => startEdit(child)} />
                                                    </>
                                                )}
                                            </td>
                                            <td>
                                                <FaTrash className="text-danger"
                                                    onClick={() => deleteCategory(child.categoryNo)} />
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
