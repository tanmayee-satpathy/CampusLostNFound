import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import "../styles/screens/PostScreen.css";
import { API_BASE_URL } from "../config/api";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const PostScreen = ({
  apiBaseUrl = API_BASE_URL,
  fetchFn = fetch,
  storage,
}) => {
  const navigate = useNavigate();
  const storageRef = useMemo(() => {
    if (storage) return storage;
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    return noopStorage;
  }, [storage]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = storageRef.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, storageRef]);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    dateFound: "",
    category: "",
    image: null,
    imagePreview: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = storageRef.getItem("token");
    if (!token) {
      alert("You must be logged in to post an item.");
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("location", formData.location.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("dateFound", formData.dateFound);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("status", "SEARCHING");

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetchFn(`${apiBaseUrl}/api/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          result?.message || "Failed to post item. Please try again.";
        throw new Error(message);
      }

      alert("Item posted successfully!");

      setFormData({
        name: "",
        location: "",
        description: "",
        dateFound: "",
        category: "",
        image: null,
        imagePreview: null,
      });

      navigate("/items");
    } catch (error) {
      alert(error.message || "Unable to post item at the moment.");
      console.error("Error posting item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Accessories",
    "Electronics",
    "Bags",
    "Clothing",
    "Books",
    "Keys",
    "Other",
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="post-screen">
      <Container className="post-container">
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="post-card">
              <Card.Body className="p-4">
                <div className="post-header">
                  <h2 className="post-title">Post a Lost Item</h2>
                  <p className="post-subtitle">
                    Help others find their lost belongings by posting an item you found
                  </p>
                </div>

                <Form onSubmit={handleSubmit} className="mt-4">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Item Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="e.g., Black Wallet, iPhone 12"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="location">
                        <Form.Label>Location Found *</Form.Label>
                        <Form.Control
                          type="text"
                          name="location"
                          placeholder="e.g., Snell Library, Curry Student Center"
                          value={formData.location}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="image">
                    <Form.Label>Item Image</Form.Label>
                    <div className="image-upload-container">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-input"
                      />
                      {formData.imagePreview && (
                        <div className="image-preview">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="preview-image"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="remove-image-btn"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                image: null,
                                imagePreview: null,
                              })
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    <Form.Text className="text-muted">
                      Upload a clear image of the item (Max size: 5MB)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      placeholder="Provide a detailed description of the item, its condition, and any distinctive features..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="dateFound">
                        <Form.Label>Date Found *</Form.Label>
                        <Form.Control
                          type="date"
                          name="dateFound"
                          value={formData.dateFound}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category *</Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="form-actions">
                    <Button
                      type="submit"
                      variant="primary"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Posting...
                        </>
                      ) : (
                        "Post Item"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="cancel-btn"
                      onClick={() => {
                        setFormData({
                          name: "",
                          location: "",
                          description: "",
                          dateFound: "",
                          category: "",
                          image: null,
                          imagePreview: null,
                        });
                      }}
                    >
                      Clear Form
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

PostScreen.propTypes = {
  apiBaseUrl: PropTypes.string,
  fetchFn: PropTypes.func,
  storage: PropTypes.shape({
    getItem: PropTypes.func.isRequired,
    setItem: PropTypes.func.isRequired,
    removeItem: PropTypes.func.isRequired,
  }),
};

export default PostScreen;
