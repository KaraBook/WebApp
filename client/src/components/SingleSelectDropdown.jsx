import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SingleSelectDropdown = ({ label, value, options, onChange, placeholder = "Select..." }) => {
  return (
    <div className="w-full">
      {label && <label className="block font-medium mb-1">{label}</label>}
      <Select value={value?.toString()} onValueChange={(val) => onChange(val)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value.toString()} value={opt.value.toString()}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SingleSelectDropdown
