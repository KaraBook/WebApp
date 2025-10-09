// components/TagInput.jsx
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TagInput({ label, values = [], onChange, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const val = inputValue.trim();
    if (val && !values.includes(val)) {
      onChange([...values, val]);
    }
    setInputValue("");
  };

  const removeTag = (tag) => {
    onChange(values.filter((v) => v !== tag));
  };

  return (
    <div className="w-full mb-4">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <div className="flex gap-2 mb-2 flex-wrap">
        {values.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-gray-600 hover:text-black"
              onClick={() => removeTag(tag)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder || "Add new amenity"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
        />
        <Button type="button" onClick={addTag}>Add</Button>
      </div>
    </div>
  );
}
