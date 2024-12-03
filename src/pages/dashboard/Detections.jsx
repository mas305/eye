import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import {
  LICENSE_PLATE_DETECTIONS_URL,
  PARKING_LOTS_WITH_CAMERAS_URL,
} from "@/data/urls";
import DropdownList from "@/widgets/common/DropdownList";

export function Detections() {
  const [parkingLots, setParkingLots] = useState([]);
  const [cameraId, setCameraId] = useState("all");
  const [parkingLotId, setParkingLotId] = useState("all");
  const [licensePlateData, setLicensePlateData] = useState([]);
  const [cameras, setCameras] = useState([]);

  // Handle parking lot selection from dropdown
  const handleParkingLotSelection = (parkingLot) => {
    setParkingLotId(parkingLot.id);
    setCameraId("all"); // Reset camera when selecting a new parking lot
    setCameras(parkingLot.cameras || []); // Update the cameras list for the selected parking lot
  };

  // Fetch parking lots
  useEffect(() => {
    const fetchParkingLots = async () => {
      const response = await fetch(PARKING_LOTS_WITH_CAMERAS_URL);
      const data = await response.json();
      // Add "All Parking Lots" as an option at the top of the list
      const allParkingLotsOption = {
        id: "all",
        name: "All Parking Lots",
        cameras: [],
      };
      setParkingLots([allParkingLotsOption, ...data.results]);
    };

    fetchParkingLots();
  }, []);

  console.log(parkingLots.map((park) => park.name));

  // Fetch license plate data based on selected parking lot and camera
  useEffect(() => {
    const fetchData = async () => {
      let url = `${LICENSE_PLATE_DETECTIONS_URL}`;

      if (parkingLotId !== "all") {
        url = `${LICENSE_PLATE_DETECTIONS_URL}?parking_lot_id=${parkingLotId}`;
      }

      if (cameraId !== "all" && parkingLotId !== "all") {
        url = `${LICENSE_PLATE_DETECTIONS_URL}?parking_lot_id=${parkingLotId}&camera_id=${cameraId}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setLicensePlateData(data.results);
    };

    fetchData();
  }, [cameraId, parkingLotId]);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Parking lot dropdown */}
      <DropdownList
        parkingLots={parkingLots}
        onSelectParkingLot={handleParkingLotSelection}
      />

      {/* Camera dropdown - Always visible */}
      <div className="hs-dropdown relative w-full">
        <button
          id="camera-dropdown"
          type="button"
          className="hs-dropdown-toggle py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none"
          disabled={parkingLotId === "all"} // Disable if "All Parking Lots" is selected
        >
          Select Camera
        </button>
        <div
          className="hs-dropdown-menu transition-[opacity,margin] duration-200 min-w-60 bg-white shadow-md rounded-lg mt-2"
          role="menu"
        >
          <div className="p-1 space-y-0.5">
            <a
              href="#"
              className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => setCameraId("all")}
            >
              All Cameras
            </a>
            {cameras.map((camera) => (
              <a
                key={camera.id}
                href="#"
                className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => setCameraId(camera.id)}
              >
                {camera.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Detections Table */}
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Detections
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "PARKING LOT ID",
                  "CAMERA ID",
                  "PLATE NUMBER",
                  "DATE",
                  "TIME",
                  "CONFIDENCE SCORE",
                  "CAR IMAGE",
                  "PLATE IMAGE",
                ].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {licensePlateData && licensePlateData.length > 0 ? (
                licensePlateData.map(
                  (
                    {
                      parking_lot,
                      camera,
                      plate_number,
                      created_at,
                      confidence_score,
                      car_image,
                      lpr_image,
                    },
                    key
                  ) => {
                    const dateTime = new Date(created_at);
                    const date = dateTime.toLocaleDateString();
                    const time = dateTime.toLocaleTimeString();
                    const className = `py-3 px-5 ${
                      key === licensePlateData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={key}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {parking_lot}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {camera}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {plate_number}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {date}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {time}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {confidence_score.toFixed(2)}
                          </Typography>
                        </td>
                        <td className={className}>
                          {car_image ? (
                            <img
                              src={car_image}
                              alt="Car"
                              className="h-16 w-24 object-cover"
                            />
                          ) : (
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              No Image
                            </Typography>
                          )}
                        </td>
                        <td className={className}>
                          {lpr_image ? (
                            <img
                              src={lpr_image}
                              alt="Plate"
                              className="h-16 w-24 object-cover"
                            />
                          ) : (
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              No Image
                            </Typography>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td colSpan="8" className="py-3 px-5 text-center">
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                      No data available.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Detections;
