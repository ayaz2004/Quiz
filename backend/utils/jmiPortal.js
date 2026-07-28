import crypto from "crypto";

export const JMI_BASE_URL = "https://admission.jmi.ac.in/EntranceResults/UniversityResult";
const PROGRAM_TYPES_URL = `${JMI_BASE_URL}`;
const PROGRAM_NAMES_URL = `${JMI_BASE_URL}/getUniversityProgramName`;
const UNIVERSITY_RESULTS_URL = `${JMI_BASE_URL}/getUniversityResults`;

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export function parseOptionsFromHtml(html) {
  const selectMatch = html.match(/<select[^>]*name=["']frm_ProgramType["'][\s\S]*?<\/select>/i);
  const selectHtml = selectMatch?.[0] || html;
  const optionRegex = /<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;
  const options = [];

  for (const match of selectHtml.matchAll(optionRegex)) {
    const id = match[1].trim();
    const name = stripTags(match[2]);

    if (!id || id.toLowerCase() === "selected" || !name) {
      continue;
    }

    options.push({ id, name });
  }

  return options;
}

export function parseProgramsFromResponse(responseBody) {
  const parsed = JSON.parse(responseBody);

  if (!Array.isArray(parsed)) {
    throw new Error("Unexpected course list response format");
  }

  return parsed
    .map((item) => ({
      id: item.CPD_ID || "",
      name: item.PROGNAME || "",
    }))
    .filter((item) => item.id && item.name);
}

export function parseResultRows(html) {
  const rows = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;

  for (const rowMatch of html.matchAll(rowRegex)) {
    const rowHtml = rowMatch[1];
    const cellMatches = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];

    if (cellMatches.length < 4) {
      continue;
    }

    const firstCell = stripTags(cellMatches[0][1]).toLowerCase();
    const secondCell = stripTags(cellMatches[1][1]).toLowerCase();

    if (
      firstCell === "s.no" ||
      firstCell === "sr.no" ||
      firstCell === "sr no" ||
      secondCell === "course name"
    ) {
      continue;
    }

    const hrefMatch = rowHtml.match(/href=["']([^"']+)["']/i);
    const href = hrefMatch?.[1]
      ? new URL(hrefMatch[1], `${JMI_BASE_URL}/`).toString()
      : null;

    rows.push({
      srNo: stripTags(cellMatches[0][1]),
      courseName: stripTags(cellMatches[1][1]),
      date: stripTags(cellMatches[2][1]),
      remark: stripTags(cellMatches[3][1]),
      link: href,
    });
  }

  return rows;
}

async function postForm(url, formData) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

export async function fetchJmiProgramTypes() {
  const response = await fetch(PROGRAM_TYPES_URL);
  if (!response.ok) {
    throw new Error(`Failed to load program types (${response.status})`);
  }

  const html = await response.text();
  return parseOptionsFromHtml(html);
}

export async function fetchJmiProgramNames(programTypeId) {
  const formData = new URLSearchParams();
  formData.set("prgType", programTypeId);

  const response = await postForm(PROGRAM_NAMES_URL, formData);
  const responseBody = await response.text();
  return parseProgramsFromResponse(responseBody);
}

export async function fetchJmiResults({ courseTypeId, courseNameId, phdDisciplineId = "" }) {
  const formData = new URLSearchParams();
  formData.set("frm_ProgramType", courseTypeId);
  formData.set("frm_ProgramName", courseNameId);
  formData.set("frm_PhDMainDiscipline", phdDisciplineId || "");

  const response = await postForm(UNIVERSITY_RESULTS_URL, formData);
  const responseBody = await response.text();
  const parsedBody = JSON.parse(responseBody);
  const htmlContent = parsedBody.UniversityResults || "";
  return parseResultRows(htmlContent);
}

export function courseKey({ courseTypeId, courseNameId, phdDisciplineId = "" }) {
  return `${courseTypeId}::${courseNameId}::${phdDisciplineId || ""}`;
}

export function fingerprintResults(results = []) {
  const normalized = results.map((row) => ({
    courseName: row.courseName || "",
    date: row.date || "",
    remark: row.remark || "",
    link: row.link || "",
  }));

  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
