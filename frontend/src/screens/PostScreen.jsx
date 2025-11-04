import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import "../styles/screens/PostScreen.css";

const PostScreen = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Post item:", formData);
    // Handle form submission here
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
                    Help others find their lost belongings by posting an item
                    you found
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
                    <Form.Label>Item Image *</Form.Label>
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
                    >
                      Post Item
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

export default PostScreen;

