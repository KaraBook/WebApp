import { State, City } from "country-state-city";

export const getIndianStates = () => State.getStatesOfCountry("IN");
export const getCitiesByState = (stateCode) => City.getCitiesOfState("IN", stateCode);

export const getStateName = (stateCode) => {
  if (!stateCode) return "";

  const state = State.getStateByCodeAndCountry(stateCode, "IN");
  return state?.name || stateCode;
};