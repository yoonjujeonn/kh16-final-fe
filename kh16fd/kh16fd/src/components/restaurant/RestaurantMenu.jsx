import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    axios
      .get(`/menu/list/${restaurantId}`)
      .then(res => setMenuList(res.data))
      .catch(err => console.error(err));
  }, [restaurantId]);

  if (menuList.length === 0) {
    return <div className="text-muted">등록된 메뉴가 없습니다</div>;
  }

  return (
    <ul className="list-unstyled">
      {menuList.map(menu => (
        <li key={menu.menuId} className="mb-3 pb-3 border-bottom">
          <div className="d-flex justify-content-between">
            <span style={{ fontSize: "1.5rem" }}>{menu.menuName}</span>
            <span style={{ fontSize: "1.2rem" }}>{menu.menuPrice.toLocaleString()}원</span>
          </div>
          {menu.menuInfo && (
            <div className="text-muted mt-1">{menu.menuInfo}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
