import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaEnvelope,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import "../styles/screens/ItemScreen.css";
import { API_BASE_URL } from "../config/api";

const ItemScreen = ({ apiBaseUrl = API_BASE_URL, fetchFn = fetch }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetchFn(`${apiBaseUrl}/api/items/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Item not found");
          } else {
            throw new Error("Failed to fetch item");
          }
          return;
        }

        const itemData = await response.json();
        setItem(itemData);

        if (itemData.userId) {
          try {
            setLoadingUser(true);
            const userResponse = await fetchFn(
              `${apiBaseUrl}/api/users/profile?userId=${itemData.userId}`
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
            }
          } finally {
            setLoadingUser(false);
          }
        }

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [apiBaseUrl, fetchFn, id]);

  if (loading) {
    return (
      <div className="item-screen">
        <Container className="text-center py-5">
          <Spinner animation="border" />
        </Container>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-screen">
        <Container className="text-center py-5">
          <h2>Item Not Found</h2>
          <p>{error}</p>
          <Button onClick={() => navigate("/items")}>Back</Button>
        </Container>
      </div>
    );
  }

  const isOwner = loggedInUserId && item.userId === loggedInUserId;

  const requestClaim = async () => {
    try {
      const res = await fetchFn(`${apiBaseUrl}/api/items/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CLAIM_REQUESTED" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setItem((prev) => ({ ...prev, status: "CLAIM_REQUESTED" }));
      alert("Claim request sent");
    } catch (err) {
      alert(err.message);
    }
  };

  const approveClaim = async () => {
    try {
      const res = await fetchFn(`${apiBaseUrl}/api/items/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CLAIMED" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setItem((prev) => ({ ...prev, status: "CLAIMED" }));
      alert("Item claimed successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const contact = user || {};

  return (
    <div className="item-screen">
      <Container>
        <Button
          variant="outline-secondary"
          className="mb-3"
          onClick={() => navigate("/items")}
        >
          ← Back
        </Button>

        <Row>
          <Col lg={7}>
            <Card>
              {item.image ? (
                <Card.Img
                  src={
                    item.image.startsWith("http")
                      ? item.image
                      : `${apiBaseUrl}${item.image}`
                  }
                />
              ) : (
                <div className="p-5 text-center">No Image</div>
              )}
            </Card>
          </Col>

          <Col lg={5}>
            <Card>
              <Card.Body>
                <h1>{item.name}</h1>

                <p>
                  <FaMapMarkerAlt /> {item.location}
                </p>
                <p>
                  <FaCalendarAlt />{" "}
                  {new Date(item.dateFound).toLocaleDateString()}
                </p>
                <p>
                  <FaTag /> {item.category}
                </p>

                <hr />

                <h5>Description</h5>
                <p>{item.description}</p>

                {/* ACTION BUTTONS */}
                <div className="mt-4">
                  {token && !isOwner && item.status === "SEARCHING" && (
                    <Button
                      variant="warning"
                      className="w-100"
                      onClick={requestClaim}
                    >
                      Request Claim
                    </Button>
                  )}

                  {token && isOwner && item.status === "CLAIM_REQUESTED" && (
                    <Button
                      variant="success"
                      className="w-100"
                      onClick={approveClaim}
                    >
                      Approve Claim
                    </Button>
                  )}

                  {item.status === "CLAIMED" && (
                    <p className="text-success text-center mt-2">
                      ✅ Item has been claimed
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Body>
                <h5>
                  <FaUser /> Contact Information
                </h5>
                <p>
                  <FaUser /> {contact.name || "N/A"}
                </p>
                <p>
                  <FaEnvelope /> {contact.email || "N/A"}
                </p>
                <p>
                  <FaPhone /> {contact.phone || "N/A"}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

ItemScreen.propTypes = {
  apiBaseUrl: PropTypes.string,
  fetchFn: PropTypes.func,
};

export default ItemScreen;
