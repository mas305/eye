// Replace '{{host}}' with the actual host URL.
const BACKEND_URL = "https://eyedentifyai-backend-production.up.railway.app";

// Update the URLs accordingly
export const PARKING_OCCUPANCY_REPORT = `${BACKEND_URL}/dashboard/parking-occupancy-report/`;
export const VEHICLE_ACTIVITY_REPORTS = `${BACKEND_URL}/dashboard/vehicle-activity-report/`;
export const LICENSE_PLATE_DETECTIONS_URL = `${BACKEND_URL}/dashboard/lp-detections`;
export const CAMERAS_URL = `${BACKEND_URL}/dashboard/camera`;
export const PARKING_LOTS_URL = `${BACKEND_URL}/dashboard/parking-lot`;
export const PARKING_LOTS_WITH_CAMERAS_URL = `${BACKEND_URL}/dashboard/parking-lot-with-camera`;
// export const PARKING_OCCUPANCY_REPORT = `${BACKEND_URL}{{host}}/dashboard/parking-occupancy-report`;

export const PARKING_OCCUPANCY_REPORTS_URL = (
  parkingLotId,
  startDate,
  endDate,
  startTime,
  endTime
) =>
  `${BACKEND_URL}/dashboard/parking-occupancy-report?parking_lot_id=${parkingLotId}&start_date=${startDate}&end_date=${endDate}&start_time=${startTime}&end_time=${endTime}`;

export const VEHICLE_ACTIVITY_REPORTS_URL = (
  parkingLotId,
  startDate,
  endDate,
  startTime,
  endTime,
  licensePlate,
  numberOfVisits,
  averageVisitDuration
) =>
  `${BACKEND_URL}/dashboard/vehicle-activity-report?parking_lot_id=${parkingLotId}&start_date=${startDate}&end_date=${endDate}&start_time=${startTime}&end_time=${endTime}&license_plate=${licensePlate}&number_of_visits=${numberOfVisits}&average_visit_duration=${averageVisitDuration}`;
