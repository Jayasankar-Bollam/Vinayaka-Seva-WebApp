// server/utils/otherField.js

// Returns a schema shape for a field that has fixed dropdown options
// PLUS an "Other" option with free text.
function otherField(enumValues) {
  return {
    value: {
      type: String,
      enum: [...enumValues, 'Other'],
      required: true,
    },
    customValue: {
      type: String,
      trim: true,
      required: function () {
        // `this` here refers to the subdocument itself
        return this.value === 'Other';
      },
    },
  };
}function displayValue(field) {
  if (!field) return '';
  return field.value === 'Other' ? field.customValue : field.value;
}

module.exports = { otherField, displayValue };
