import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Typography,
  Select,
  Option,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input, // Import the Input component for the License Plate text box
  Alert, // Import Alert for error notification
} from "@material-tailwind/react";

import {
  PARKING_LOTS_WITH_CAMERAS_URL,
  VEHICLE_ACTIVITY_REPORTS,
} from "@/data/urls";

export function VehicleActivity() {
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [licensePlate, setLicensePlate] = useState(""); // New state for License Plate
  const [postData, setPostData] = useState(null); // State for post data
  const [openModal, setOpenModal] = useState(false); // State to handle modal visibility
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message
  const [minVisits, setMinVisits] = useState(""); // New state for minimum number of visits
  const [maxVisits, setMaxVisits] = useState(""); // New state for maximum number of visits
  const [minVisitDuration, setMinVisitDuration] = useState(""); // New state for minimum visit duration
  const [maxVisitDuration, setMaxVisitDuration] = useState(""); // New state for maximum visit duration

  // Fetch parking lots data
  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response = await fetch(PARKING_LOTS_WITH_CAMERAS_URL);
        const data = await response.json();
        setParkingLots(data.results);
      } catch (error) {
        console.error("Error fetching parking lots:", error);
      }
    };

    fetchParkingLots();
  }, []);

  const getDateRange = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case "last24":
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        endDate = today;
        break;
      case "last7days":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        endDate = today;
        break;
      case "last30days":
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        endDate = today;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    return { startDate, endDate };
  };

  const getTimeRange = (time) => {
    let startTime, endTime;

    switch (time) {
      case "morning":
        startTime = "06:00:00";
        endTime = "12:00:00";
        break;
      case "afternoon":
        startTime = "12:00:00";
        endTime = "18:00:00";
        break;
      case "evening":
        startTime = "18:00:00";
        endTime = "00:00:00";
        break;
      case "allDay":
      default:
        startTime = "00:00:00";
        endTime = "23:59:59";
    }

    return { startTime, endTime };
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation based on conditions:
    // 1. Either the license plate should be provided OR
    // 2. The number of visits and duration should be provided
    if (
      (!licensePlate &&
        (!minVisits || !maxVisits || !minVisitDuration || !maxVisitDuration)) ||
      (!minVisits &&
        !maxVisits &&
        !minVisitDuration &&
        !maxVisitDuration &&
        !licensePlate)
    ) {
      setErrorMessage(
        "Please fill in either the License Plate or the number of Visits and Duration."
      );
      return;
    }

    // Prepare the date and time range for the request
    const { startDate, endDate } = getDateRange(dateRange);
    const { startTime, endTime } = getTimeRange(timeOfDay);

    const post = {
      parking_lot_id: selectedParkingLot,
      start_date: startDate ? startDate.toISOString().split("T")[0] : null,
      end_date: endDate ? endDate.toISOString().split("T")[0] : null,
      start_time: startTime,
      end_time: endTime,
      license_plate: licensePlate || null, // If no license plate, set it as null
      min_visits: minVisits || null, // If no visits, set it as null
      max_visits: maxVisits || null, // If no max visits, set it as null
      min_visit_duration: minVisitDuration || null, // If no duration, set it as null
      max_visit_duration: maxVisitDuration || null, // If no max duration, set it as null
    };

    try {
      const response = await axios.post(VEHICLE_ACTIVITY_REPORTS, post, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data || Object.keys(response.data).length === 0) {
        // No data found, show error message
        setErrorMessage("No data found. Please try with different filters.");
      } else {
        // Data found, show in modal
        setPostData(response.data);
        setOpenModal(true); // Open modal to show post data
        setErrorMessage(""); // Reset error message
      }
    } catch (error) {
      console.error("Error fetching vehicle activity:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };
  const [key, setKey] = useState(0);

  const handleCloseModal = () => setOpenModal(false);
  console.log(postData);

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <Typography variant="h4" color="blue-gray" className="mb-4">
        Parking Data Filters
      </Typography>

      {/* Error message pop-up */}
      {errorMessage && (
        <Alert color="red" variant="filled" className="mb-4">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Parking Lot Selection */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            Parking Lot
          </Typography>
          <Select
            key={key} // This will force the component to re-render
            value={selectedParkingLot}
            onChange={(e) => {
              const value = e;
              setSelectedParkingLot(value);
              setKey((prev) => prev + 1); // Trigger re-render by updating key
            }}
            label="Select Parking Lot"
            required
          >
            {parkingLots.map((parkingLot) => (
              <Option key={parkingLot.id} value={parkingLot.id.toString()}>
                {parkingLot.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Date Range Selection */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            Date Range
          </Typography>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e)}
            label="Select Date Range"
            required
          >
            <Option value="last24">Last 24 Hours</Option>
            <Option value="last7days">Last 7 Days</Option>
            <Option value="last30days">Last 30 Days</Option>
          </Select>
        </div>

        {/* Time of Day Selection */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            Time of Day
          </Typography>
          <Select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e)}
            label="Select Time of Day"
            required
          >
            <Option value="allDay">All Day</Option>
            <Option value="morning">Morning (6 AM - 12 PM)</Option>
            <Option value="afternoon">Afternoon (12 PM - 6 PM)</Option>
            <Option value="evening">Evening (6 PM - 12 AM)</Option>
          </Select>
        </div>

        {/* License Plate Text Box */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            License Plate
          </Typography>
          <Input
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            label="Enter License Plate"
          />
        </div>

        {/* Number of Visits */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            Number of Visits
          </Typography>
          <div className="flex space-x-4">
            <Input
              type="number"
              value={minVisits}
              onChange={(e) => setMinVisits(e.target.value)}
              label="Min Visits"
            />
            <Input
              type="number"
              value={maxVisits}
              onChange={(e) => setMaxVisits(e.target.value)}
              label="Max Visits"
            />
          </div>
        </div>

        {/* Visit Duration */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            Visit Duration (Minutes)
          </Typography>
          <div className="flex space-x-4">
            <Input
              type="number"
              value={minVisitDuration}
              onChange={(e) => setMinVisitDuration(e.target.value)}
              label="Min Duration"
            />
            <Input
              type="number"
              value={maxVisitDuration}
              onChange={(e) => setMaxVisitDuration(e.target.value)}
              label="Max Duration"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" color="black" className="w-full">
          Submit
        </Button>
      </form>

      {/* Modal to display filtered results */}
      <Dialog open={openModal} handler={handleCloseModal}>
        <DialogHeader>Filtered Vehicle Activity</DialogHeader>
        <DialogBody>
          {postData && postData.length > 0 ? (
            <div className="overflow-auto max-h-96">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    {/* Column headers */}
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Parking Lot Name
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Plate Number
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Number of Visits
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Average Visit Duration (mins)
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Car Image
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Plate Image
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {postData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {item.parking_lot_name || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.plate_number || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.number_of_visits || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.average_visit_duration || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.car_image ? (
                          <img
                            src={item.car_image}
                            alt="Car"
                            className="w-20 h-20 object-cover"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.plate_image ? (
                          <img
                            src={item.plate_image}
                            alt="Plate"
                            className="w-20 h-20 object-cover"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCloseModal}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}
