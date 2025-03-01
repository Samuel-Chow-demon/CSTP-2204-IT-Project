export function getBusyStatus(totalSpots, availableSpots) {
  if (totalSpots === 0) {
    return { label: "No Data", color: "gray" };
  }
  const occupiedSpots = totalSpots - availableSpots;
  const occupancy = (occupiedSpots / totalSpots) * 100;
  if (occupancy >= 90) {
    return { label: "Too Busy", color: "red" };
  } else if (occupancy >= 40) {
    return { label: "Fairly Busy", color: "yellow" };
  } else {
    return { label: "Not Busy", color: "green" };
  }
}
