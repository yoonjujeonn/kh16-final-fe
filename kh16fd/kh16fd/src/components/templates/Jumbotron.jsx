//props는 외부에서 전달되는 값의 모음
export default function Jumbotron({ subject = "제목", detail = "", bgColor = "primary", textColor = "light" }) {

    return (
        <>
            <div className="row mt-4">
                <div className="col">
                    <div className={`bg-${bgColor} text-${textColor} p-4 rounded`}>
                        <h1 className={`text-${textColor}`}>{subject}</h1>
                    </div>
                </div>
            </div>
        </>)
}