import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SearchResults.css"; // style it like HomeScreen.css

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("query");

  const [results, setResults] = useState([]);

  useEffect(() => {
    // fake fetch for now - replace with Firebase logic
    const fetchResults = async () => {
      if (!query) return;
      // pretend to call Firebase here
      const dummyResults = [
        { id: 1, name: "Sample Location 1", address: "123 Road" },
        { id: 2, name: "Sample Location 2", address: "456 Avenue" }
      ];
      setResults(dummyResults);
    };

    fetchResults();
  }, [query]);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <button className="back-btn" onClick={handleBack}>⬅ Back</button>
        <h2>Search Results</h2>
      </div>

      <div className="search-results">
        {results.length > 0 ? (
          results.map((res) => (
            <div className="result-card" key={res.id}>
              <div className="result-title">{res.name}</div>
              <div className="result-address">{res.address}</div>
            </div>
          ))
        ) : (
          <p className="no-results">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
