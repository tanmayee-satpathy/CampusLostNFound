import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Item from "../components/Item";
import "../styles/screens/HomeScreen.css";

const isBrowser = typeof window !== "undefined";
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : isBrowser
    ? window.location.origin
    : "http://localhost:4000";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const HomeScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Request only searching items (not claimed) with limit of 4
        const response = await fetch(
          `${API_BASE_URL}/api/items?status=searching&limit=4`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        // Handle both old format (array) and new format (object with items and pagination)
        let itemsArray = [];
        if (Array.isArray(data)) {
          // Old format - filter out claimed items
          itemsArray = data.filter((item) => item.status !== "claimed");
        } else if (data.items && Array.isArray(data.items)) {
          // New format - use items from paginated response
          itemsArray = data.items;
        } else {
          itemsArray = [];
        }

        // Sort by dateFound (most recent first) and take first 4
        const recentItems = [...itemsArray]
          .sort((a, b) => new Date(b.dateFound) - new Date(a.dateFound))
          .slice(0, 4);
        setItems(recentItems);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="home-screen">
      <Container>
        <h1 className="home-title">Recent Lost Items</h1>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p>Error loading items: {error}</p>
          </div>
        ) : items.length > 0 ? (
          <Row>
            {items.map((item) => (
              <Col key={item._id} sm={12} md={6} lg={4} xl={3}>
                <Item item={item} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5">
            <p>No items found.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default HomeScreen;
