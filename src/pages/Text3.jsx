import { Listbox } from "@headlessui/react";
import { useState } from "react";

const options = ["Gate-in", "Sailing", "Handover"];

export default function Text3() {
  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full sm:w-1/2">
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative">
            <Listbox.Button className="w-full rounded-md border border-gray-300 bg-white p-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
              {selected || "Select Validity Type"}
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  value={option}
                  className={({ active }) =>
                    `cursor-pointer select-none p-2 ${
                      active ? "bg-indigo-100" : ""
                    }`
                  }
                >
                  {option}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    </div>
  );
}
