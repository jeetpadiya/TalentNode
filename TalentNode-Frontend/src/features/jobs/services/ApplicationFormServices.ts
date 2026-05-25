import type { ApiErrorResponse } from "../../../types/types";
import { z } from "zod";
import { applicationFieldSchema, applicationFormSchema, customQuestionSchema } from "./ApplicationFormSchema";
// import type { Job } from "./JobSchema";

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'


const parseApiResponse = async<T>(
    response: Response,
    parser: (data: unknown) => T,
): Promise<T> => {
    const data: unknown = await response.json();

    if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw new Error(errorData.message || "Unknown API error");
    }
    return parser(data);
}

export type ApplicationField = z.infer<typeof applicationFieldSchema>;
export type ApplicationFormData =z.infer<typeof applicationFormSchema>;
export type CustomQuestion = z.infer<typeof customQuestionSchema>;

export const getApplicationForm = async(

    jobId:string,
    accessToken:string

)=>{
console.log(
  `${API_BASE_URL}/jobs/${jobId}/application-form`
)
    const response  = await fetch(`${API_BASE_URL}/jobs/${jobId}/application-form`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            
        },
    });

    return parseApiResponse(response, (data) => applicationFormSchema.parse(data));

}

export const UpdateApplicationForm = async (
  jobId: string,
  applicationForm: ApplicationFormData,
  accessToken: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/application-form`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        applicationForm,
      }),
    }
  );

return parseApiResponse(
  response,
  (data) =>
    applicationFormSchema.parse(
      (data as { applicationForm: unknown })
        .applicationForm
    )
);
};




