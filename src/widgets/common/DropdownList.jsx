import React, { useState, useEffect } from "react";

const DropdownList = ({ parkingLots, onSelectParkingLot }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleParkingLotClick = (parkingLot) => {
    onSelectParkingLot(parkingLot);
    setIsOpen(false);
  };

  return (
    <div className="hs-dropdown relative w-full">
      <button
        id="hs-dropdown-default"
        type="button"
        className="hs-dropdown-toggle py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Dropdown"
        onClick={toggleDropdown}
      >
        Select Parking Lot
        <svg
          className={`hs-dropdown-open:rotate-180 size-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`hs-dropdown-menu transition-[opacity,margin] duration ${
          isOpen ? "opacity-100 block" : "opacity-0 hidden"
        } min-w-60 bg-white shadow-md rounded-lg mt-2`}
        role="menu"
      >
        <div className="p-1 space-y-0.5">
          {parkingLots.map((lot) => (
            <a
              key={lot.id}
              className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
              href="#"
              onClick={() => handleParkingLotClick(lot)}
            >
              {lot.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DropdownList;
