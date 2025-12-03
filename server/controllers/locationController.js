import Property from "../models/Property.js";


export const getUniqueLocations = async (req, res) => {
  try {
    const properties = await Property.find(
      { isDraft: false, publishNow: true },
      "state city area"
    );

    const stateMap = {};

    properties.forEach((p) => {
      const state = (p.state || "").trim();
      const city = (p.city || "").trim();
      const area = (p.area || "").trim();  

      if (!state) return;

      if (!stateMap[state]) stateMap[state] = {};

      if (city) {
        if (!stateMap[state][city]) stateMap[state][city] = new Set();
        if (area) stateMap[state][city].add(area);  
      }
    });

    const formatted = Object.entries(stateMap).map(([state, cities]) => ({
      state,
      cities: Object.entries(cities).map(([city, areas]) => ({
        city,
        areas: [...areas],
      })),
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Location fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to load locations" });
  }
};
