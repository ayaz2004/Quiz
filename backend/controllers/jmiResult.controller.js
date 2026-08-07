import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import {
  fetchJmiProgramNames,
  fetchJmiProgramTypes,
  fetchJmiResults,
} from "../utils/jmiPortal.js";

export const getJmiProgramTypes = async (req, res, next) => {
  try {
    const programTypes = await fetchJmiProgramTypes();

    return res.status(200).json(
      new ApiResponse(200, { programTypes }, "Program types loaded successfully")
    );
  } catch (error) {
    next(new ApiError(500, error.message || "Unable to load program types"));
  }
};

export const getJmiProgramNames = async (req, res, next) => {
  try {
    const programTypeId = (req.query.programTypeId || req.query.typeId || "").trim();

    if (!programTypeId) {
      throw new ApiError(400, "programTypeId is required");
    }

    const programs = await fetchJmiProgramNames(programTypeId);

    return res.status(200).json(
      new ApiResponse(200, { programs }, "Program names loaded successfully")
    );
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, error.message || "Unable to load program names"));
  }
};

export const searchJmiResults = async (req, res, next) => {
  try {
    const {
      courseTypeId = "",
      courseNameId = "",
      phdDisciplineId = "",
    } = req.body || {};

    if (!courseTypeId || !courseNameId) {
      throw new ApiError(400, "courseTypeId and courseNameId are required");
    }

    const results = await fetchJmiResults({
      courseTypeId,
      courseNameId,
      phdDisciplineId,
    });

    return res.status(200).json(
      new ApiResponse(200, { results }, "JMI results loaded successfully")
    );
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, error.message || "Unable to load results"));
  }
};
