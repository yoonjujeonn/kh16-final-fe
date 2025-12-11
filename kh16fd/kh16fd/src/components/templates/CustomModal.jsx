export default function CustomModal({show, onClose, title, children}){
    if(!show) return null;

    return (
        <>
        <div className="modal fade show" tabIndex={-1} data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                        <div className="modal-footer">
                            <button className={`ms-2 btn btn-primary`} onClick={onClose}>닫기</button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}