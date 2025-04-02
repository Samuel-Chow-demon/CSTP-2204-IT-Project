// src/components/Search/SearchBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${query}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search for parking location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <IconButton type="submit" className="search-icon-btn">
        <SearchIcon style={{ color: "#6f268b" }} />
      </IconButton>
    </form>
  );
};

export default SearchBar;
