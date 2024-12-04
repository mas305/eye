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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
      const allParkingLotsOption = {
        id: "all",
        name: "All Parking Lots",
        cameras: [],
      };
      setParkingLots([allParkingLotsOption, ...data.results]);
    };

    fetchParkingLots();
  }, []);

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
      {/* Parking lot dropdown with label */}
      <div className="mb-6">
        <label
          htmlFor="parking-lot"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Selected Parking Lot:
        </label>
        <DropdownList
          parkingLots={parkingLots}
          onSelectParkingLot={handleParkingLotSelection}
        />
        {parkingLotId !== "all" && (
          <div className="mt-1 text-sm text-gray-600 bg-gray-100 rounded-lg p-2">
            <i className="fas fa-building text-gray-500 mr-2"></i>{" "}
            {/* Optional icon */}
            {parkingLots.find((lot) => lot.id === parkingLotId)?.name ||
              "Select a parking lot"}
          </div>
        )}
      </div>

      {/* Camera dropdown with label */}
      <div className="hs-dropdown relative w-full mb-6">
        <label
          htmlFor="camera-dropdown"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Selected Camera:
        </label>
        <button
          id="camera-dropdown"
          type="button"
          className="hs-dropdown-toggle py-3 px-5 inline-flex items-center gap-x-3 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={parkingLotId === "all"}
        >
          <span className="truncate">Select Camera</span>
          <i className="fas fa-chevron-down ml-2"></i> {/* Dropdown icon */}
        </button>
        <div
          className="hs-dropdown-menu transition-all duration-200 bg-white shadow-md rounded-lg mt-2 w-full"
          role="menu"
        >
          <div className="p-1 space-y-0.5">
            <a
              href="#"
              className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => setCameraId("all")}
            >
              <i className="fas fa-camera-retro text-gray-500 mr-2"></i>{" "}
              {/* Camera icon */}
              All Cameras
            </a>
            {cameras.map((camera) => (
              <a
                key={camera.id}
                href="#"
                className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => setCameraId(camera.id)}
              >
                <i className="fas fa-camera text-gray-500 mr-2"></i>{" "}
                {/* Camera icon */}
                {camera.name}
              </a>
            ))}
          </div>
        </div>
        {cameraId !== "all" && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-100 rounded-lg p-2">
            <i className="fas fa-video text-gray-500 mr-2"></i>{" "}
            {/* Camera icon */}
            {cameras.find((cam) => cam.id === cameraId)?.name ||
              "Select a camera"}
          </div>
        )}
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
                              className="h-16 w-24 object-cover cursor-pointer"
                              onClick={() => {
                                setSelectedImage(car_image);
                                setIsModalOpen(true);
                              }}
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
                              className="h-16 w-24 object-cover cursor-pointer"
                              onClick={() => {
                                setSelectedImage(lpr_image);
                                setIsModalOpen(true);
                              }}
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

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsModalOpen(false)} // Close modal on clicking outside
        >
          <div
            className="relative bg-white p-4 rounded-lg shadow-lg w-1/2 "
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-red-500 hover:text-white bg-red-100 hover:bg-red-500 rounded-full p-2 transition duration-300"
              onClick={() => setIsModalOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <img
              src={selectedImage}
              alt="Enlarged"
              className="w-96 rounded-md"
              style={{
                maxHeight: "80vh", // Maximum height: 80% of the viewport
                objectFit: "fill", // Ensures the image fits within its container
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Detections;
