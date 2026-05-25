import type { ApiErrorResponse } from "../../../types/types";
import { z } from "zod";

import { hiringStageSchema, type Job } from "./JobSchema";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

const parseApiResponse = async <T>(
  response: Response,
  parser: (data: unknown) => T,
): Promise<T> => {
  const data: unknown = await response.json();

  if (!response.ok) {
    throw data as ApiErrorResponse;
  }

  return parser(data);
};

const hiringStagesResponseSchema = z.object({
  success: z.boolean(),
  hiringStages: z.array(hiringStageSchema),
});

export type HiringStage = Job["hiringStages"][number];

export type SaveHiringPipelineInput = {
  id?: string;
  name: string;
  order: number;
};

const saveHiringPipelineSchema = z.array(
  z.object({
    id: z.string().optional(),
    name: z.string().trim().min(1),
    order: z.number().int().min(0),
  }),
);

export const getHiringStages = async (
  jobId: string,
  accessToken: string,
): Promise<HiringStage[]> => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/hiring-stages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await parseApiResponse(response, (value) =>
    hiringStagesResponseSchema.parse(value),
  );

  return data.hiringStages;
};

export const saveHiringPipeline = async (
  jobId: string,
  stages: SaveHiringPipelineInput[],
  accessToken: string,
): Promise<HiringStage[]> => {
  const validatedStages = saveHiringPipelineSchema.parse(stages);

  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/hiring-pipeline`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stages: validatedStages,
      }),
    },
  );

  const data = await parseApiResponse(response, (value) =>
    hiringStagesResponseSchema.parse(value),
  );

  return data.hiringStages;
};
