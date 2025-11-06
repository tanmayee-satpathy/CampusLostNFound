import React from "react";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import "../styles/components/Item.css";

const isBrowser = typeof window !== "undefined";
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : isBrowser
  ? window.location.origin
  : "http://localhost:4000";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const Item = ({ item }) => {
  // Construct full image URL if image exists
  const imageUrl = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${API_BASE_URL}${item.image}`
    : null;

  return (
    <Card className="mb-4 item-card h-100">
      <Link to={`/item/${item._id}`} className="item-image-link">
        {imageUrl ? (
          <Card.Img variant="top" src={imageUrl} className="item-image" alt={item.name} />
        ) : (
          <div className="item-image-placeholder">
            <p>No Image</p>
          </div>
        )}
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="item-title">
          <Link to={`/item/${item._id}`} className="item-link">
            <strong>{item.name}</strong>
          </Link>
        </Card.Title>
        <Card.Text className="item-location">
          <h3>{item.location}</h3>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Item;

