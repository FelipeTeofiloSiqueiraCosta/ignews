import axios from "axios";

export const api = axios.create({
  baseURL: "https://ignews-sigma-lime.vercel.app/api",
});
