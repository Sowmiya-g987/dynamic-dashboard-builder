// src/components/Modals/ConfigModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import type { Widget } from "../../hooks/useWidgetStore";

type Props = {
  show: boolean;
  onHide: () => void;
  widget: Widget;
  onApply: (data: { x: string; y: string; url: string; branch?: string; typeOf?: string }) => void;
};

const ConfigModal: React.FC<Props> = ({ show, onHide, widget, onApply }) => {
  const [branch, setBranch] = useState(widget.data.branch || "");
  const [typeOf, setTypeOf] = useState(widget.data.typeOf || "Employee");


  const branches = ["Pondy", "Hyderabad", "Pune", "Bangalore", "Chennai"];

  useEffect(() => {
    setBranch(widget.data.branch || "");
    setTypeOf(widget.data.typeOf || "Employee");
  }, [widget]);

  const apply = () => {
    const url = `http://localhost:8080/api/Branch/filter?branch=${encodeURIComponent(branch)}&type=${encodeURIComponent(typeOf)}`;
    onApply({ x: "branch", y: typeOf === "Employee" ? "NofEmployee" : "NofIntern", url, branch, typeOf });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Configure {widget.type}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Branch</Form.Label>
            <Form.Select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select value={typeOf} onChange={(e) => setTypeOf(e.target.value)}>
              <option value="Employee">Employee</option>
              <option value="Intern">Intern</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={apply} disabled={!branch}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfigModal;
