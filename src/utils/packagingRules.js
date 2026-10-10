/**
 * 📦 SCRUNCHIEFRILLS™ DYNAMIC PACKAGING ENGINE
 * Strictly enforces packaging business rules:
 * - Products sold strictly in multiples of 3 (3, 6, 9, 12, 15, 18...)
 * - 5x5x5" box holds up to 9 cloud scrunchies
 * - 8x6" packet holds up to 3 cloud scrunchies
 */
export const resolvePackagingMetrics = (itemCount) => {
  const count = Number(itemCount) || 0;

  if (count < 3 || count % 3 !== 0) {
    return {
      isValidPack: false,
      boxes: 0,
      packets: 0,
      packagingType: "Invalid Pack (Must be multiple of 3)",
      length: 12.7,
      breadth: 12.7,
      height: 12.7,
      weight: 0.45,
    };
  }

  let boxes = 0;
  let packets = 0;

  if (count % 9 === 3) {
    boxes = Math.floor(count / 9);
    packets = 1;
  } else {
    boxes = Math.ceil(count / 9);
    packets = 0;
  }

  // Packaging summary label for UI
  const packageDescriptions = [];
  if (boxes > 0) packageDescriptions.push(`${boxes} Box${boxes > 1 ? "es" : ""} (5"x5"x5")`);
  if (packets > 0) packageDescriptions.push(`${packets} Packet (8"x6")`);
  const packagingType = packageDescriptions.join(" + ");

  // Dead weight: ~0.04 kg per scrunchie + packaging material tare
  const totalWeight = Math.max(
    0.2,
    Number((count * 0.04 + boxes * 0.09 + packets * 0.03).toFixed(2))
  );

  // Composite master dimensions in cm for Shiprocket volumetric calculation
  let length = 12.7;
  let breadth = 12.7;
  let height = 12.7;

  if (boxes === 0 && packets === 1) {
    length = 20.3; // 8 inches
    breadth = 15.2; // 6 inches
    height = 2.5; // 1 inch
  } else if (boxes > 0 && packets === 0) {
    length = 12.7;
    breadth = 12.7;
    height = Number((12.7 * boxes).toFixed(1)); // stacked or contiguous box bundle
  } else {
    // boxes + 1 packet
    length = 20.3;
    breadth = 15.2;
    height = Number((12.7 * boxes + 2.5).toFixed(1));
  }

  return {
    isValidPack: true,
    boxes,
    packets,
    packagingType,
    length,
    breadth,
    height,
    weight: totalWeight,
  };
};