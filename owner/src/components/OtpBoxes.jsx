import { useRef, useEffect } from "react";

export default function OtpBoxes({ value, setValue, length = 6 }) {

  const inputs = useRef([]);

  useEffect(() => {
  inputs.current[0]?.focus();
}, []);

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/, "");
    if (!digit) return;

    const newOtp = value.split("");
    newOtp[i] = digit;
    setValue(newOtp.join(""));

    if (i < length - 1) inputs.current[i + 1].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      const newOtp = value.split("");
      newOtp[i] = "";
      setValue(newOtp.join(""));

      if (i > 0) inputs.current[i - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    setValue(pasted);
    inputs.current[Math.min(pasted.length - 1, length - 1)].focus();
  };

  return (
    <div className="flex justify-center gap-2 mt-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          value={value[i] || ""}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          className="
            w-12 h-14
            text-xl font-semibold text-center
            border rounded-xl
            focus:ring-2 focus:ring-primary
            focus:border-primary
            outline-none
            bg-white
          "
        />
      ))}
    </div>
  );
}