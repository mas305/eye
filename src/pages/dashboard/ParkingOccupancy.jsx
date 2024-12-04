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
} from "@material-tailwind/react";

import {
  PARKING_LOTS_WITH_CAMERAS_URL,
  PARKING_OCCUPANCY_REPORT,
} from "@/data/urls";

export function ParkingOccupancy() {
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [postData, setPostData] = useState(null); // State for post data
  const [openModal, setOpenModal] = useState(false); // State to handle modal visibility

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

    // Validate that all required fields are selected
    if (!selectedParkingLot || !dateRange || !timeOfDay) {
      alert(
        "Please fill out all the required fields: Parking Lot, Date Range, and Time of Day."
      );
      return; // Stop form submission
    }

    // Get the start and end dates based on the selected date range
    const { startDate, endDate } = getDateRange(dateRange);

    // Get the start and end times based on the selected time of day
    const { startTime, endTime } = getTimeRange(timeOfDay);

    const post = {
      parking_lot_id: selectedParkingLot,
      start_date: startDate ? startDate.toISOString().split("T")[0] : null, // Format date as YYYY-MM-DD
      end_date: endDate ? endDate.toISOString().split("T")[0] : null,
      start_time: startTime,
      end_time: endTime,
    };

    console.log("Request Payload:", post);

    try {
      // Make the POST request using axios
      const response = await axios.post(PARKING_OCCUPANCY_REPORT, post, {
        headers: { "Content-Type": "application/json" },
      });

      // Show the post data in a modal upon success
      setPostData(response.data);
      setOpenModal(true); // Open modal to show post data
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  // Function to close the modal
  const handleCloseModal = () => setOpenModal(false);
  const [key, setKey] = useState(0);

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <Typography variant="h4" color="blue-gray" className="mb-4">
        Parking Data Filters
      </Typography>
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
          >
            <Option value="allDay">All Day</Option>
            <Option value="morning">Morning (6 AM - 12 PM)</Option>
            <Option value="afternoon">Afternoon (12 PM - 6 PM)</Option>
            <Option value="evening">Evening (6 PM - 12 AM)</Option>
          </Select>
        </div>

        {/* Submit Button */}
        <Button type="submit" color="black">
          Generate Report
        </Button>
      </form>

      {/* Modal to view post data */}
      <Dialog open={openModal} handler={handleCloseModal}>
        <DialogHeader>Parking Occupancy Report</DialogHeader>
        <DialogBody>
          {postData && (
            <div className="flex justify-center items-center">
              {/* Card 1: Unfinished Visits Count */}
              <Card className="shadow-lg p-4 m-2 max-w-sm text-center border-2 border-gray-200">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Unfinished Visits Count
                </Typography>
                <Typography variant="h4" color="blue" className="font-bold">
                  {postData.unfinished_visits_count}
                </Typography>
              </Card>

              {/* Card 2: Occupancy Percentage */}
              <Card className="shadow-lg p-4 m-2 max-w-sm text-center border-2 border-gray-200">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Occupancy Percentage
                </Typography>
                <Typography variant="h4" color="green" className="font-bold">
                  {postData.occupancy_percentage}%
                </Typography>
              </Card>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button color="red" onClick={handleCloseModal}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}

export default ParkingOccupancy;
