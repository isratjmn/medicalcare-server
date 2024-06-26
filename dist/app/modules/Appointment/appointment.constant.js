"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRelationalFieldsMapper = exports.appointmentRelationalFields = exports.appointmentFilterableFields = exports.appointmentSearchableFields = void 0;
exports.appointmentSearchableFields = [
    "status",
    "paymentStatus",
];
exports.appointmentFilterableFields = [
    "searchTerm",
    "status",
    "paymentStatus",
    "patientEmail",
    "doctorEmail",
];
exports.appointmentRelationalFields = [
    "patientEmail",
    "doctorEmail",
];
exports.appointmentRelationalFieldsMapper = {
    patientEmail: "patient",
    doctorEmail: "doctor",
};
