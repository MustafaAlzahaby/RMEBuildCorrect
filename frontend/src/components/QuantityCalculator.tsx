import { useState } from "react";
import { Input } from "@/components/ui/input";

const dimensions = ["Length (m)", "Width (m)", "Thickness (m)", "Number of identical elements"];

export function QuantityCalculator() {
  const [values, setValues] = useState(["", "", "", ""]);
  const [length, width, thickness, count] = values.map(Number);
  const elements = values[3] === "" ? 1 : count;
  const volume = length * width * thickness * elements;
  const valid =
    length > 0 &&
    width > 0 &&
    thickness > 0 &&
    Number.isSafeInteger(elements) &&
    elements > 0 &&
    Number.isFinite(volume) &&
    volume > 0;
  const invalid = values.some(
    (value, index) =>
      value !== "" && (Number(value) <= 0 || (index === 3 && !Number.isSafeInteger(Number(value)))),
  );
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Illustrative Gross Volume Calculator</h2>
        <p className="mt-2 text-muted-foreground">
          Rectangular concrete volume = length × width × thickness × number of elements.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {dimensions.map((label, index) => (
          <label key={label} className="space-y-2 text-sm font-medium">
            <span>
              {label}
              {index === 3 && " (optional)"}
            </span>
            <Input
              type="number"
              step={index === 3 ? 1 : "any"}
              min={index === 3 ? 1 : 0}
              value={values[index]}
              placeholder={index === 3 ? "1" : undefined}
              onChange={(event) => {
                const value = event.target.value;
                setValues((previous) => previous.map((entry, i) => (i === index ? value : entry)));
              }}
            />
          </label>
        ))}
      </div>
      <output
        aria-live="polite"
        className="block rounded-lg border border-primary/30 bg-primary/10 p-4"
      >
        {valid
          ? `${new Intl.NumberFormat(undefined, { maximumSignificantDigits: 8 }).format(volume)} m³`
          : invalid
            ? "Use positive dimensions and a positive whole number of elements."
            : "Enter positive dimensions to calculate the gross volume."}
      </output>
      <p className="text-sm text-muted-foreground">
        Payable quantities must be determined according to approved drawings and applicable
        contractual measurement rules. Project BOQ items, drawing references and contractual
        measurement details are awaiting verified input.
      </p>
      <ol aria-label="Illustrative QS workflow" className="flex flex-wrap gap-2 text-sm">
        {[
          "Approved Drawings",
          "Activity Execution",
          "Inspection Records",
          "Quantity Measurement",
          "Commercial Documentation",
        ].map((item) => (
          <li key={item} className="rounded-md border px-3 py-2">
            {item}
          </li>
        ))}
      </ol>
    </section>
  );
}
