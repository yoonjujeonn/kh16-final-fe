import { useState } from "react";


export default function StarRatingInput({ rating, onRatingChange, disabled = false }) {

    const [hoverRating, setHoverRating] = useState(0); 
    
    // ⭐⭐ 크기 정의 (텍스트 크기에 맞게 조정) ⭐⭐
    const fontSize = 32; // 폰트 크기
    const starCount = 5;
    const spacing = 4; // 별 사이의 간격 (픽셀 단위)
    
    const halfSize = fontSize / 2; // 16px (이벤트 감지용)
    const activeRating = hoverRating || rating;

    // 핸들러 함수는 동일
    const handleMouseEnter = (starValue) => { if (!disabled) setHoverRating(starValue); };
    const handleMouseLeave = () => { if (!disabled) setHoverRating(0); };
    const handleClick = (starValue) => { if (!disabled) onRatingChange(starValue); };
    
    // 0.5부터 5.0까지의 10개 값 (이벤트 감지용)
    const starValues = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5);

    // ⭐⭐ Width 기반 계산 로직 (텍스트 크기와 간격 사용) ⭐⭐
    // (텍스트 크기 5개) + (별 사이 간격 4개) 
    const totalStarWidth = (starCount * fontSize) + ((starCount - 1) * spacing); 
    const filledWidth = (activeRating / 5) * totalStarWidth;
    
    // ⭐⭐ 5개의 텍스트 별을 문자열로 생성 ⭐⭐
    const emptyStars = "☆".repeat(starCount);
    const filledStars = "★".repeat(starCount); 

    return (
        <div 
            className={`d-flex align-items-center ${disabled ? 'disabled-rating' : ''}`} 
            style={{ 
                lineHeight: 1, // 텍스트이므로 lineHeight 조정
                position: 'relative',
                display: 'inline-flex',
                fontSize: `${fontSize}px`, // 폰트 사이즈 적용
            }}
        >

            {/* 1. ⭐⭐ 배경 레이어 (5개의 빈 별 텍스트) ⭐⭐ */}
            <div 
                style={{ 
                    pointerEvents: 'none', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0,
                    color: "#e4e5e9", // 회색
                    letterSpacing: `${spacing}px`, // 텍스트 간격 적용
                }}
            >
                {emptyStars}
            </div>

            {/* 1.1 ⭐⭐ 전경 레이어 (채워진 별 텍스트 - 폭으로 조절) ⭐⭐ */}
            <div 
                style={{ 
                    overflow: 'hidden',
                    // ⭐⭐ 이 폭(width)으로 0.5 단위 반쪽 채우기 구현
                    width: `${filledWidth}px`, 
                    pointerEvents: 'none', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0,
                    color: "#ffc107", // 노란색
                    letterSpacing: `${spacing}px`, // 텍스트 간격 적용
                }}
            >
                {filledStars}
            </div>


            {/* 2. ⭐⭐ 이벤트 감지 레이어 (10개의 투명한 0.5점 영역) ⭐⭐ */}
            <div style={{ position: 'relative', display: 'flex' }}>
                {starValues.map((starValue) => {
                    const cursorStyle = disabled ? 'default' : 'pointer';
                    
                    const isFullStarEnd = starValue % 1 === 0;
                    
                    return (
                        <div
                            key={starValue}
                            style={{
                                width: `${halfSize}px`, // 16px (반쪽)
                                height: `${fontSize}px`, // 32px
                                position: 'relative', 
                                cursor: cursorStyle,
                                
                                // 텍스트 간격이 4px이므로 짝수 번째 div 뒤에만 4px 간격 적용
                                marginRight: isFullStarEnd ? `${spacing}px` : '0', 
                            }}
                            
                            onClick={() => handleClick(starValue)}
                            onMouseEnter={() => handleMouseEnter(starValue)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* 투명한 레이어 */}
                        </div>
                    );
                })}
            </div>

            <span className="ms-3 fs-5 text-warning">
                {activeRating > 0 ? activeRating.toFixed(1) : ' \u00A0 선택하세요'}
            </span>
        </div>
    );
}