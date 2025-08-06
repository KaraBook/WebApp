import Select from "react-select";

const SingleSelectDropdown = ({ label, value, options, onChange }) => {
  return (
    <div className="w-full">
      {label && <label className="block font-medium mb-1">{label}</label>}
      <Select
        options={options}
        value={options.find((opt) => opt.value === value) || null}
        onChange={(selected) => onChange(selected?.value)}
      />
    </div>
  );
};

export default SingleSelectDropdown;
