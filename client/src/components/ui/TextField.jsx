import { Label } from "../ui/label";
import { Input } from "../ui/input";

const TextField = ({ label, name, value, onChange, required = false, type = "text", className = "", placeholder }) => {
  return (
    <div className="w-[48%]">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`mt-2 ${className}`}
      />
    </div>
  );
};

export default TextField;
