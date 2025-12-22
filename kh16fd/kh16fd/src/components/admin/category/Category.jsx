import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../../templates/Jumbotron";
import axios from "axios";
import { FaPlus, FaTrash, FaXmark, FaEdit, FaAsterisk } from "react-icons/fa6";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";

export default function Category() {

    const [categoryList, setCategoryList] = useState([]);

    const [category, setCategory] = useState({
        categoryName: "",
        parentCategoryNo: "",
    });

    const [validName, setValidName] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        try {
            const res = await axios.get("http://192.168.20.12:8080/category/");
            setCategoryList(res.data);
        } catch {
            toast.error("카테고리 목록 로딩 실패");
        }
    }, []);

    const changeStrValue = useCallback((e) => {
        const { name, value } = e.target;
        setCategory(prev => ({ ...prev, [name]: value }));
    }, []);

    const changeNumberValue = useCallback((e) => {
        const onlyNum = e.target.value.replace(/[^0-9]/g, "");
        setCategory(prev => ({ ...prev, parentCategoryNo: onlyNum }));
    }, []);

    const checkCategoryName = useCallback(() => {
        const ok = category.categoryName.trim().length > 0;
        setValidName(ok ? "is-valid" : "is-invalid");
    }, [category]);

    const buildPayload = useCallback(() => ({
        categoryName: category.categoryName,
        parentCategoryNo: category.parentCategoryNo === "" ? null : Number(category.parentCategoryNo)
    }), [category]);

    const modal = useRef();

    const openModal = useCallback(() => {
        Modal.getOrCreateInstance(modal.current).show();
    }, []);

    const closeModal = useCallback(() => {
        Modal.getInstance(modal.current).hide();
    }, []);

    const clearData = useCallback(() => {
        setCategory({ categoryName: "", parentCategoryNo: "" });
        setValidName("");
    }, []);

    const clearAndCloseModal = useCallback(() => {
        closeModal();
        setTimeout(() => clearData(), 100);
    }, [closeModal, clearData]);

    const sendData = useCallback(async () => {
        if (validName !== "is-valid") return;

        try {
            await axios.post(
                "http://192.168.20.12:8080/admin/category",
                buildPayload(),
                { withCredentials: true }
            );
            toast.success("카테고리 등록 완료");
            loadData();
            clearAndCloseModal();
        } catch {
            toast.error("등록 실패");
        }
    }, [validName, buildPayload, loadData, clearAndCloseModal]);

    const isEdit = category.categoryNo !== undefined;

    const editData = useCallback((item) => {
        setCategory({
            categoryNo: item.categoryNo,
            categoryName: item.categoryName,
            parentCategoryNo: item.parentCategoryNo === null ? "" : String(item.parentCategoryNo)
        });
        setValidName("is-valid");
        openModal();
    }, [openModal]);

    const editConfirmData = useCallback(async () => {
        if (validName !== "is-valid") return;

        try {
            await axios.put(
                `http://192.168.20.12:8080/admin/category/${category.categoryNo}`,
                buildPayload(),
                { withCredentials: true }
            );
            toast.success("카테고리 수정 완료");
            loadData();
            clearAndCloseModal();
        } catch {
            toast.error("수정 실패");
        }
    }, [validName, category.categoryNo, buildPayload, loadData, clearAndCloseModal]);

    const deleteData = useCallback(async (item) => {
        const ok = await Swal.fire({
            title: "삭제하시겠습니까?",
            text: "하위 카테고리가 있으면 삭제할 수 없습니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
        });

        if (!ok.isConfirmed) return;

        try {
            await axios.delete(
                `http://192.168.20.12:8080/admin/category/${item.categoryNo}`,
                { withCredentials: true }
            );
            toast.success("삭제 완료");
            loadData();
        } catch {
            toast.error("삭제 실패");
        }
    }, [loadData]);

    return (
        <>
            <Jumbotron subject="카테고리 관리" detail="카테고리를 등록·수정·삭제할 수 있습니다." />

            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-success" onClick={openModal}>
                        <FaPlus className="me-2" /> 신규 카테고리 등록
                    </button>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <table className="table table-striped text-center">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>이름</th>
                                <th>상위 번호</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryList.map(item => (
                                <tr key={item.categoryNo}>
                                    <td>{item.categoryNo}</td>
                                    <td>{item.categoryName}</td>
                                    <td>{item.parentCategoryNo ?? "-"}</td>
                                    <td>
                                        <FaEdit className="text-warning me-3" style={{ cursor: "pointer" }}
                                            onClick={() => editData(item)}
                                        />
                                        <FaTrash className="text-danger" style={{ cursor: "pointer" }}
                                            onClick={() => deleteData(item)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="modal fade" tabIndex="-1" ref={modal} data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                {isEdit ? `${category.categoryNo}번 카테고리 수정` : "신규 카테고리 등록"}
                            </h5>
                        </div>

                        <div className="modal-body">
                            <div className="row mb-3">
                                <label className="col-sm-3 col-form-label">
                                    이름 <FaAsterisk className="text-danger" />
                                </label>
                                <div className="col-sm-9">
                                    <input
                                        type="text"
                                        name="categoryName"
                                        className={`form-control ${validName}`}
                                        value={category.categoryName}
                                        onChange={changeStrValue}
                                        onBlur={checkCategoryName}
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <label className="col-sm-3 col-form-label">상위 번호</label>
                                <div className="col-sm-9">
                                    <input
                                        type="text"
                                        name="parentCategoryNo"
                                        className="form-control"
                                        value={category.parentCategoryNo}
                                        onChange={changeNumberValue}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-danger" onClick={clearAndCloseModal}>
                                <FaXmark className="me-2" /> 취소
                            </button>

                            {isEdit ? (
                                <button className="btn btn-warning" disabled={validName !== "is-valid"} onClick={editConfirmData}>
                                    <FaEdit className="me-2" /> 수정하기
                                </button>
                            ) : (
                                <button className="btn btn-success" disabled={validName !== "is-valid"} onClick={sendData}>
                                    <FaPlus className="me-2" /> 등록하기
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
