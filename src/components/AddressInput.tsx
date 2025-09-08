"use client";

import { useEffect, useState } from "react";

export default function AddressInput({ inputText = "", onChange, error }) {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(inputText);
  const [isValid, setIsValid] = useState(false);

  // sincronizar cuando viene de fuera
  useEffect(() => {
    setInputValue(inputText);
  }, [inputText]);

  const handleInput = async (e) => {
    const query = e.target.value;
    setInputValue(query); // solo texto local, no guardamos todavía en form
    setIsValid(false);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `/api/search-address?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching address:", err);
      setSuggestions([]);
    }
  };

  const handleSelect = (place) => {
    const address = place.display_name || "";
    setInputValue(address);
    setIsValid(true);

    // guardamos valores en el form principal
    onChange("address", address);
    onChange(
      "city",
      place.address?.city ||
        place.address?.town ||
        place.address?.village ||
        place.address?.hamlet ||
        place.address?.state ||
        ""
    );
    onChange("lat", place.lat || "");
    onChange("lon", place.lon || "");

    setSuggestions([]);
  };

  return (
    <div className="flex flex-col relative">
      <input
        name="address"
        value={inputValue}
        onChange={handleInput}
        placeholder="* Shipping Address"
        className={`w-full border rounded px-3 py-2 text-sm text-gray-900 ${
          isValid ? "border-green-400" : "border-red-400"
        }`}
      />

      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10 max-h-60 overflow-auto">
          {suggestions.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="px-3 py-2 cursor-pointer hover:bg-pink-100 text-sm text-gray-800 font-medium"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}

      {!isValid && inputValue && (
        <p className="text-xs text-red-600 mt-1 h-4">
          Please select a valid address from the list
        </p>
      )}
      {error && <p className="text-xs text-red-600 mt-1 h-4">{error}</p>}
    </div>
  );
}
