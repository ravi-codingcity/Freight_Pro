import Select from "react-select";

const options = [
  { value: "Gate-in", label: "For Gate-in" },
  { value: "Sailing", label: "For Sailing" },
  { value: "Handover", label: "For Handover" },
];

export default function Text2({ validity_for, setValidity_for }) {
  const handleChange = (selectedOption) => {
    setValidity_for(selectedOption.value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full sm:w-1/2">
        <Select
          options={options}
          value={options.find((option) => option.value === validity_for)}
          onChange={handleChange}
          placeholder="Select Validity Type"
          className="text-base"
        />
      </div>
    </div>
  );
}
