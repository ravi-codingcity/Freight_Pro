// Function to get container size options for dropdowns
export const getContainerSizeOptions = () => {
  return [
    { label: "20ft Standard Container", value: "20ft ST" },
    { label: "40ft Standard Container", value: "40ft ST" },
    { label: "40ft High Cube Container", value: "40ft H.Q" },
    { label: "45ft High Cube Container", value: "45ft H.Q" },
    { label: "20ft Reefer Container", value: "20ft RF" },
    { label: "40ft Reefer Container", value: "40ft RF" },
    { label: "40ft High Cube Reefer Container", value: "40ft H.Q-RF" },
    { label: "20ft Open Top In-Gauge Container", value: "20ft OT-In" },
    { label: "40ft Open Top In-Gauge Container", value: "40ft OT-In" },
    { label: "20ft Open Top Out-of-Gauge Container", value: "20ft OT-Out" },
    { label: "40ft Open Top Out-of-Gauge Container", value: "40ft OT-Out" },
    { label: "20ft Flat Rack Container", value: "20ft FR" },
    { label: "40ft Flat Rack Container", value: "40ft FR" },
    { label: "20ft Hazardous Container", value: "20ft Haz" },
    { label: "40ft Hazardous Container", value: "40ft Haz" },
  ];
};

// Helper function to determine container size category (20ft or 40ft) based on container type
export const getContainerSizeCategory = (containerType) => {
  if (!containerType) return null;

  if (
    containerType.startsWith("20") ||
    containerType.startsWith("20ft") ||
    containerType === "20ft-OT-In"
  ) {
    return "20ft";
  } else if (
    containerType.startsWith("40") ||
    containerType.startsWith("40ft") ||
    containerType.startsWith("45") ||
    containerType.startsWith("45ft") ||
    containerType === "40ft-OT-In"
  ) {
    return "40ft";
  }

  return null;
};
