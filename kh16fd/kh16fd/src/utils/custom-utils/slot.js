// slot.js
import { addDays, format, addMinutes, parse, isAfter, addHours } from "date-fns";
import { ko } from "date-fns/locale";

const parseTimeWithDate = (timeStr, date, isLastOrder = false) => {
  if (!timeStr) timeStr = "00:00";

  let [hours, minutes] = timeStr.split(":").map(Number);

  // 라스트 오더가 당일 기준 23:59를 초과하면 제한
  if (isLastOrder && (hours > 23 || (hours === 23 && minutes > 59))) {
    hours = 23;
    minutes = 59;
  }

  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);

  return newDate;
};

export function buildRestaurantSlots({ restaurant, slotList }) {
  if (!restaurant) return [];

  const todayDate = new Date();
  const now = new Date(); // 현재 시각
  const openingDays = restaurant.restaurantOpeningDays?.split(",") ?? [];
  const holidayDates = restaurant.holiday_dates ? restaurant.holiday_dates.split(",") : [];

  return Array.from({ length: 14 }).map((_, i) => {
    const date = addDays(todayDate, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const dayName = format(date, "eee", { locale: ko });

    const slot = slotList.find(
      s => s.restaurantId === restaurant.restaurantId && s.reservationDate === formattedDate
    );

    const isOpenDay = openingDays.length === 0 || openingDays.includes(dayName);
    const isHoliday = holidayDates.includes(formattedDate);

    const closeTime = parseTimeWithDate(restaurant.restaurantClose, formattedDate, true);
    let status = "예약 가능";
    if (!isOpenDay || isHoliday) {
      status = "휴무";
    } else if (slot && slot.reservedSeatCount >= slot.totalSeatCount) {
      status = "예약 마감";
    } else if (format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd") && now > closeTime) {
      // 오늘 날짜이고 현재 시각이 라스트 오더 이후면
      status = "영업 마감";
    }

    const slots = [];
    if (status === "예약 가능") {
      let currentTime = parseTimeWithDate(restaurant.restaurantOpen, formattedDate);
      const endTime = parseTimeWithDate(restaurant.restaurantLastOrder, formattedDate, true);

      while (currentTime < endTime) {
        // 오늘 날짜이면 현재 시각 이전은 건너뛰기
        if (format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd") && currentTime <= now) {
          currentTime = addMinutes(currentTime, restaurant.reservationInterval || 30);
          continue;
        }

        slots.push({
          timeStr: format(currentTime, "HH:mm"),
          isAvailable: true,
        });

        currentTime = addMinutes(currentTime, restaurant.reservationInterval || 30);
      }
    }

    return {
      date: formattedDate,
      dateStr: format(date, "MM.dd"),
      dayName,
      status,
      slots,
    };
  });
}

export function buildAvailableSlots({ restaurant, slotDate, peopleCount }) {
  if (!restaurant || !slotDate) return [];

  const now = new Date();
  const slots = [];

  let openTime = parseTimeWithDate(restaurant.restaurantOpen, slotDate, false);
  const endTime = parseTimeWithDate(restaurant.restaurantLastOrder, slotDate, true);

  let currentTime = openTime;

  const isToday = format(slotDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

  const isAfterOpen = isToday && now >= openTime;

  const limitTime = isAfterOpen ? addHours(now, 1) : null;

  while (currentTime < endTime) {
    // 오늘 날짜이면 현재 시각 이전은 건너뛰기
    if (isToday && currentTime <= limitTime) {
      currentTime = addMinutes(
        currentTime,
        restaurant.reservationInterval || 30
      );
      continue;
    }

    slots.push({
      timeStr: format(currentTime, "HH:mm"),
      isAvailable: peopleCount <= restaurant.seatMaxPeople,
    });

    currentTime = addMinutes(currentTime, restaurant.reservationInterval || 30);
  }

  return slots;
}

