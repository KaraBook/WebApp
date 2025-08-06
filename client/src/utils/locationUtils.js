import { State, City } from "country-state-city";

export const getIndianStates = () => {
  return State.getStatesOfCountry("IN"); 
};

export const getCitiesByState = (stateCode) => {
  return City.getCitiesOfState("IN", stateCode); 
};
