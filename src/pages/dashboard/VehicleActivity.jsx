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
  const [numberOfVisits, setNumberOfVisits] = useState(""); // New state for Number of Visits
  const [visitDuration, setVisitDuration] = useState(""); // New state for Visit Duration
  const [postData, setPostData] = useState(null); // State for post data
  const [openModal, setOpenModal] = useState(false); // State to handle modal visibility
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

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

    // Simple validation to check if all required fields are filled
    if (
      !selectedParkingLot ||
      !dateRange ||
      !timeOfDay ||
      !licensePlate ||
      !numberOfVisits ||
      !visitDuration
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const { startDate, endDate } = getDateRange(dateRange);
    const { startTime, endTime } = getTimeRange(timeOfDay);

    const post = {
      parking_lot_id: selectedParkingLot,
      start_date: startDate ? startDate.toISOString().split("T")[0] : null,
      end_date: endDate ? endDate.toISOString().split("T")[0] : null,
      start_time: startTime,
      end_time: endTime,
      license_plate: licensePlate,
      number_of_visits: numberOfVisits,
      visit_duration: visitDuration,
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

  const handleCloseModal = () => setOpenModal(false);
  console.log(postData);
  const [key, setKey] = useState(0);

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
            required
          />
        </div>

        {/* Number of Visits Text Box */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            Number of Visits
          </Typography>
          <Input
            value={numberOfVisits}
            onChange={(e) => setNumberOfVisits(e.target.value)}
            label="Enter Number of Visits"
            type="number"
            required
            min="1"
          />
        </div>

        {/* Visit Duration Text Box */}
        <div>
          <Typography variant="small" color="gray" className="mb-1">
            Visit Duration (Minutes)
          </Typography>
          <Input
            value={visitDuration}
            onChange={(e) => setVisitDuration(e.target.value)}
            label="Enter Visit Duration in Minutes"
            type="number"
            required
            min="1"
          />
        </div>

        <Button type="submit" color="black" fullWidth>
          Submit
        </Button>
      </form>

      {/* Modal to display vehicle activity report data */}
      <Dialog open={openModal} handler={handleCloseModal}>
        <DialogHeader>Vehicle Activity Report</DialogHeader>
        <DialogBody>
          <div>
            <Typography variant="h6">Report Data:</Typography>

            {postData && Array.isArray(postData) && postData.length > 0 ? (
              postData.map((record, index) => (
                <div key={index} className="mb-6">
                  {/* Plate Number as Text */}
                  <Typography variant="body1">
                    <strong>Plate Number:</strong> {record.plate_number}
                  </Typography>

                  {/* Car Image */}
                  <div className="mt-2">
                    <Typography variant="body1">
                      <strong>Car Image:</strong>
                    </Typography>
                    <img
                      src={record.car_image}
                      alt={`Car ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Plate Image */}
                  <div className="mt-2">
                    <Typography variant="body1">
                      <strong>Plate Image:</strong>
                    </Typography>
                    <img
                      src={record.plate_image}
                      alt={`Plate ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Parking Lot Name */}
                  <Typography variant="body1" className="mt-4">
                    <strong>Parking Lot Name:</strong> {record.parking_lot_name}
                  </Typography>

                  {/* Number of Visits */}
                  <Typography variant="body1" className="mt-2">
                    <strong>Number of Visits:</strong> {record.number_of_visits}
                  </Typography>

                  {/* Average Visit Duration */}
                  <Typography variant="body1" className="mt-2">
                    <strong>Average Visit Duration:</strong>{" "}
                    {record.average_visit_duration} mins
                  </Typography>
                </div>
              ))
            ) : (
              <Typography>No data available.</Typography>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outlined" color="red" onClick={handleCloseModal}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}
export default VehicleActivity;
