/**
 * Collection of tiny, presentation‑only helpers used by `insightElement.js`.
 * Each helper renders a specific data‑shape so the main switch‑statement can stay compact and readable.
 * NOTE:
 * • Keep styling concerns in CSS (insights.css) via the classNames below.
 */

import React from 'react';

/* -------------------------------------------------------------------------- */
/*  Centralised emptiness check                                               */
/* -------------------------------------------------------------------------- */
const isNonEmpty = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(isNonEmpty);
  if (typeof value === 'object') {
    if (React.isValidElement(value)) return true;
    return Object.values(value).some(isNonEmpty);
  }
  return true; // numbers, booleans, anything truthy
};

/* -------------------------------------------------------------------------- */
/*  Generic formatter                                                         */
/* -------------------------------------------------------------------------- */
const RenderData = (datum) => {
  if (!isNonEmpty(datum)) return null;

  // React element → passthrough
  if (React.isValidElement(datum)) return datum;

  /* ---------- Special case: { label, value } ----------------------------- */
  if (
    typeof datum === 'object' &&
    !Array.isArray(datum) &&
    'label' in datum &&
    'value' in datum &&
    Object.keys(datum).length === 2
  ) {
    if (!isNonEmpty(datum.value)) return null;
    return (
      <div className="insight-field">
        <div className="insight-label"><strong>{datum.label}</strong>:</div>
        <div className="insight-value">{RenderData(datum.value)}</div>
      </div>
    );
  }

  /* ----------------------------- ARRAY ----------------------------------- */
  if (Array.isArray(datum)) {
    const filtered = datum.filter(isNonEmpty);
    if (filtered.length === 0) return null;

    return (
      <div className="insight-array">
        {filtered.map((item, idx) => (
          <div key={idx} className="insight-array-item">
            <span className="bullet">• </span>
            {RenderData(item)}
          </div>
        ))}
      </div>
    );
  }

  /* ----------------------------- OBJECT ---------------------------------- */
  if (typeof datum === 'object') {
    const entries = Object.entries(datum).filter(([, v]) => isNonEmpty(v));
    if (entries.length === 0) return null;

    return (
      <div className="insight-object">
        {entries.map(([k, v]) => (
          <div key={k} className="insight-field">
            <div className="insight-label"><strong>{k}</strong>:</div>
            <div className="insight-value">{RenderData(v)}</div>
          </div>
        ))}
      </div>
    );
  }

  /* --------------------------- PRIMITIVE --------------------------------- */
  return <span className="insight-primitive">{String(datum).trim()}</span>;
};

/* -------------------------------------------------------------------------- */
/*  Status helper                                                             */
/* -------------------------------------------------------------------------- */
const StatusButtonField = ({ data }) => {
  if (!isNonEmpty(data)) return null;

  const label = typeof data === 'object' ? data.label || data.state || '' : data;
  const state = (typeof data === 'object' ? data.state || data.label : label)
    .toString()
    .toLowerCase();

  return (
    <span className={`status-pill status-${state.replace(/\s+/g, '-')}`}>
      {label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*  List‑item wrappers                                                        */
/* -------------------------------------------------------------------------- */
const wrapper = (className) =>
  ({ data }) => (isNonEmpty(data) ? <div className={className}>{RenderData(data)}</div> : null);

const ActionItem = wrapper('insight-action-item');
const ItineraryItem = wrapper('insight-itinerary-item');
const TaskItem = wrapper('insight-task-item');
const TimelineDate = wrapper('insight-timeline-date');

/* -------------------------------------------------------------------------- */
export {
  StatusButtonField,
  ActionItem,
  ItineraryItem,
  TaskItem,
  TimelineDate,
  RenderData,
};